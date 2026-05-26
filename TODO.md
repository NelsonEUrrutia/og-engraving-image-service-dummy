## In Progress

- [ ] Build `index.js` — Express server with `POST /upload` route

## Up Next

- [ ] Add `npm start` script to `package.json`
- [ ] Implement step 1: `stagedUploadsCreate` mutation
- [ ] Implement step 2: PUT binary to presigned S3 URL
- [ ] Implement step 3: `fileCreate` mutation, return CDN URL
- [ ] Test upload flow end-to-end locally
- [ ] Deploy to Railway and set env vars

## Blocked

## Done

- [x] Initialize Node.js project (`npm init`)
- [x] Install dependencies: express, multer, cors, dotenv
- [x] Remove `node-fetch` (Node 18+ native fetch is sufficient)
- [x] Create `.gitignore`
- [x] Create `.env` with required vars
