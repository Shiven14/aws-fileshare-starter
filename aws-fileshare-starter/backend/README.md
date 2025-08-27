# Backend (Lambdas) — Setup Notes

## Environment variables (each Lambda)
- `REGION` (e.g., `us-east-1`)
- `BUCKET` (S3 bucket for file storage, e.g., `fileshare-yourname-dev`)
- `TABLE` (DynamoDB table for metadata, e.g., `files-metadata-dev`)

## IAM permissions (execution role)
- S3: `GetObject`, `PutObject`, `HeadObject` on your BUCKET
- DynamoDB: `PutItem`, `GetItem`, `Query` on your TABLE
- (CloudWatch Logs is attached by default for Lambda)

## Packaging / Deploying
Each Lambda should be zipped with its own `index.mjs` + **node_modules** from this `backend` package:

```bash
# From backend/
npm install

# getPresignUrl
cd getPresignUrl
zip -r ../getPresignUrl.zip index.mjs ../node_modules ../package.json

# postProcessUpload
cd ../postProcessUpload
zip -r ../postProcessUpload.zip index.mjs ../node_modules ../package.json

# listFiles
cd ../listFiles
zip -r ../listFiles.zip index.mjs ../node_modules ../package.json
```

Upload each zip in the AWS Lambda console, set the handler to `index.handler`, runtime **Node.js 20.x**, and configure the env vars.

## Wiring events
- **API Gateway (HTTP API)** routes:
  - `POST /presign` → `getPresignUrl`
  - `GET  /list` → `listFiles`
  - Authorizer: **JWT** with your Cognito User Pool (issuer) and App Client ID (audience).
- **S3 event**: On the **files bucket**, create an event notification `s3:ObjectCreated:*` → target `postProcessUpload` Lambda.