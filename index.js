require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

const { SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, PORT = 3000 } = process.env;
const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;

let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);

  tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return tokenCache.token;
}

async function shopifyGraphQL(query, variables = {}) {
  const token = await getAccessToken();
  const res = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function pollForFileUrl(fileId, maxAttempts = 10, delayMs = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await shopifyGraphQL(
      `query getFile($id: ID!) {
        file(id: $id) {
          fileStatus
          ... on MediaImage { image { url } }
          ... on GenericFile { url }
        }
      }`,
      { id: fileId }
    );
    const file = data.file;
    if (file.fileStatus === 'READY') return file.image?.url ?? file.url;
    if (file.fileStatus === 'FAILED') throw new Error('Shopify file processing failed');
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error('Timed out waiting for Shopify file to be ready');
}

app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No image provided' });

  try {
    // Step 1: get presigned S3 URL from Shopify
    const stagedData = await shopifyGraphQL(
      `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters { name value }
          }
          userErrors { field message }
        }
      }`,
      {
        input: [{
          filename: file.originalname,
          mimeType: file.mimetype,
          resource: 'FILE',
          fileSize: String(file.size),
          httpMethod: 'PUT',
        }],
      }
    );

    const { userErrors, stagedTargets } = stagedData.stagedUploadsCreate;
    if (userErrors.length) return res.status(400).json({ error: userErrors[0].message });

    const { url: s3Url, resourceUrl, parameters } = stagedTargets[0];

    // Step 2: PUT the binary directly to the presigned S3 URL
    const putHeaders = { 'Content-Type': file.mimetype };
    for (const { name, value } of parameters) putHeaders[name] = value;

    const s3Res = await fetch(s3Url, { method: 'PUT', headers: putHeaders, body: file.buffer });
    if (!s3Res.ok) {
      return res.status(500).json({ error: `S3 upload failed: ${s3Res.status}` });
    }

    // Step 3: register the file with Shopify to get the CDN URL
    const fileData = await shopifyGraphQL(
      `mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            ... on MediaImage { image { url } }
            ... on GenericFile { url }
          }
          userErrors { field message }
        }
      }`,
      {
        files: [{
          originalSource: resourceUrl,
          contentType: 'IMAGE',
        }],
      }
    );

    const { userErrors: fileErrors, files } = fileData.fileCreate;
    if (fileErrors.length) return res.status(400).json({ error: fileErrors[0].message });

    const created = files[0];
    const cdnUrl = created.fileStatus === 'READY'
      ? (created.image?.url ?? created.url)
      : await pollForFileUrl(created.id);

    res.json({ url: cdnUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Image upload service running on port ${PORT}`));
