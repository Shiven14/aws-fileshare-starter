// backend/getPresignUrl/index.mjs
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3Client({ region: process.env.REGION });
const ddb = new DynamoDBClient({ region: process.env.REGION });
const BUCKET = process.env.BUCKET;
const TABLE = process.env.TABLE;

export const handler = async (event) => {
  try {
    const claims = event.requestContext?.authorizer?.jwt?.claims || {};
    const userSub = claims.sub;
    if (!userSub) return json(401, { error: "Unauthenticated" });

    const body = event.body ? JSON.parse(event.body) : {};
    const { op, key, contentType } = body;
    if (!op || !key) return json(400, { error: "op and key required" });

    const safeName = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `${userSub}/uploads/${safeName}`;

    let command, expiresIn = 60 * 5;

    if (op === "PUT") {
      command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: objectKey,
        ContentType: contentType || "application/octet-stream",
        ServerSideEncryption: "AES256"
      });
    } else if (op === "GET") {
      // optional safety: confirm ownership in DynamoDB
      const got = await ddb.send(new GetItemCommand({
        TableName: TABLE,
        Key: { userId: { S: userSub }, objectKey: { S: objectKey } }
      }));
      if (!got.Item) return json(404, { error: "Not found" });

      command = new GetObjectCommand({ Bucket: BUCKET, Key: objectKey });
    } else {
      return json(400, { error: "Unsupported op" });
    }

    const url = await getSignedUrl(s3, command, { expiresIn });
    return json(200, { url, objectKey });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Internal error" });
  }
};

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});