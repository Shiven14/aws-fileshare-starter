// backend/postProcessUpload/index.mjs
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3Client({ region: process.env.REGION });
const ddb = new DynamoDBClient({ region: process.env.REGION });
const TABLE = process.env.TABLE;

export const handler = async (event) => {
  for (const rec of event.Records ?? []) {
    const bucket = rec.s3.bucket.name;
    const key = decodeURIComponent(rec.s3.object.key.replace(/\+/g, " "));
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const [userId] = key.split("/");
    await ddb.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        userId:     { S: userId },
        objectKey:  { S: key },
        size:       { N: String(head.ContentLength ?? 0) },
        etag:       { S: (head.ETag ?? "").replaceAll('"', "") },
        contentType:{ S: head.ContentType ?? "application/octet-stream" },
        uploadedAt: { N: String(Math.floor(Date.now() / 1000)) }
      }
    }));
  }
  return { ok: true };
};