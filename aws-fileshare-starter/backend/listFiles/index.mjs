// backend/listFiles/index.mjs
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
const ddb = new DynamoDBClient({ region: process.env.REGION });
const TABLE = process.env.TABLE;

export const handler = async (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  const userSub = claims.sub;
  if (!userSub) return json(401, { error: "Unauthenticated" });

  const q = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": { S: userSub } },
    Limit: 100
  }));

  const items = (q.Items ?? []).map(i => ({
    objectKey: i.objectKey.S,
    size: Number(i.size?.N ?? 0),
    uploadedAt: Number(i.uploadedAt?.N ?? 0),
    contentType: i.contentType?.S ?? "application/octet-stream"
  }));

  return json(200, { items });
};

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});