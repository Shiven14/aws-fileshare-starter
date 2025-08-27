AWS Serverless File‑Sharing — Starter (Free‑Tier Friendly)
A serverless Dropbox‑lite using Cognito + API Gateway (HTTP) + Lambda + S3 + DynamoDB with a small React frontend.

AWS Resources (create via Console)
S3 (files bucket): fileshare-<yourname>-dev

Block all public access: ON
Default encryption (SSE-S3): ON
Lifecycle rule (dev): delete objects after 7–14 days (optional but recommended)
DynamoDB: files-metadata-dev

PK: userId (String)
SK: objectKey (String)
Cognito User Pool (Hosted UI)

App client: public client (no secret)
Allowed callback/logout URLs: include your local http://localhost:5173 and later your S3 website URL
Note: save User Pool ID, App Client ID, Hosted UI domain
Lambdas (Node.js 20):

getPresignUrl — env: REGION, BUCKET, TABLE
postProcessUpload — env: REGION, TABLE
listFiles — env: REGION, TABLE
IAM (execution role) minimal permissions:

For getPresignUrl: S3 GetObject, PutObject, HeadObject on your bucket; DynamoDB GetItem, Query on the table
For postProcessUpload: S3 HeadObject; DynamoDB PutItem on the table
For listFiles: DynamoDB Query on the table
S3 Event → Lambda

On files bucket: event s3:ObjectCreated:* → target postProcessUpload
API Gateway (HTTP API)

JWT Authorizer (Cognito): issuer (User Pool), audience (App Client ID)
Routes:
POST /presign → getPresignUrl
GET  /list → listFiles
CORS: allow your frontend origin(s)
Frontend S3 website (optional now)

Create fileshare-web-<yourname>-dev
Enable static website hosting; upload frontend/dist/ after build
Add website URL to Cognito callback/logout URLs
Local Dev
Backend: see backend/README.md for zipping/deploying each Lambda
Frontend:
cd frontend
cp .env.example .env  # fill values
npm install
npm run dev
Free‑Tier Tips
Keep file sizes small; short‑lived presigned URLs (5–10 minutes).
DynamoDB on‑demand; minimal CloudWatch alarms.
Add a cleanup script to empty buckets when done.
— Built by Shiven • Happy hacking!

