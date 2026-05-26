# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Standalone Node.js microservice that handles image uploads for a Shopify custom engraving feature. The Shopify theme (separate repo) only stores the filename/filetype as cart line item properties — this service bridges the gap by accepting the raw image, uploading it to Shopify's CDN via the Files API, and returning the CDN URL for the theme to attach to the cart.

Deployed on Railway.

## Upload Flow

Three-step Shopify Files API pattern, in order:
1. **Staged upload** — call `stagedUploadsCreate` mutation to get a presigned S3 URL
2. **S3 PUT** — upload the binary directly to the presigned S3 URL
3. **fileCreate** — call `fileCreate` mutation with the staged upload's resource URL to register it in Shopify Files and get the final CDN URL

## Stack

- **express** ^5.2.1 — HTTP server, defines the upload route
- **multer** ^2.1.1 — parses `multipart/form-data` so `req.file` contains the image binary
- **cors** ^2.8.6 — required because storefront JS calls this service cross-origin from the browser
- **dotenv** ^17.4.2 — loads `.env` locally; Railway injects real env vars in production

Do not add `node-fetch` — Node 18+ (Railway default) has native `fetch` built in.

## Env vars

| Variable | Purpose |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | e.g. `your-store.myshopify.com` |
| `SHOPIFY_CLIENT_ID` | Client ID from Dev Dashboard app settings |
| `SHOPIFY_CLIENT_SECRET` | Client Secret from Dev Dashboard app settings |
| `PORT` | Defaults to `3000` locally; Railway sets this automatically |

**Do not use `SHOPIFY_ACCESS_TOKEN`** — this service uses a Dev Dashboard app (client credentials grant), not a static admin token. The token is fetched and cached automatically in `index.js`.

## Commands

```bash
npm install      # install dependencies
npm start        # start the server (once index.js and the start script exist)
```

## Authentication

App was created via the **Dev Dashboard** (not Shopify admin). Dev Dashboard apps use the **client credentials grant** — no static `shpat_` token is issued. `index.js` calls `POST /admin/oauth/access_token` with `grant_type: client_credentials` and caches the result until 60 seconds before expiry.

The app was installed on the store with "Embed app in Shopify admin" **unchecked** (API-only, no UI). The post-install redirect to `https://example.com` is expected and harmless.

Required scope: `write_files`.

## Architecture

Entry point is `index.js`. Exposes a single `POST /upload` route that runs the three-step Shopify Files API flow. Token is fetched via `getAccessToken()` and cached in-memory.
