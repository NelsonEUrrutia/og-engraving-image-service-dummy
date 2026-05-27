## In Progress

## Up Next

- [ ] Fill in `.env` with real `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_STORE_DOMAIN`
- [ ] Deploy to Railway and set env vars in Railway dashboard
- [ ] Replace `localhost:3000` with the Railway-generated URL in the Shopify theme and any Postman collections

## Blocked

## Done

- [x] Initialize Node.js project (`npm init`)
- [x] Install dependencies: express, multer, cors, dotenv
- [x] Remove `node-fetch` (Node 18+ native fetch is sufficient)
- [x] Create `.gitignore`
- [x] Create `.env` with required vars
- [x] Build `index.js` — Express server with `POST /upload` route
- [x] Add `npm start` script to `package.json`
- [x] Implement step 1: `stagedUploadsCreate` mutation
- [x] Implement step 2: PUT binary to presigned S3 URL
- [x] Implement step 3: `fileCreate` mutation, return CDN URL
- [x] Create Dev Dashboard app with `write_files` scope, install on store
- [x] Switch auth from static token to client credentials grant (`SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET`)
- [x] Rename endpoint from `/upload` to `/upload-engraving-image`
- [x] Test upload flow end-to-end locally and confirm CDN URL is returned
