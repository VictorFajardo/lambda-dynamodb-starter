import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const isOffline = process.env.AWS_SAM_LOCAL === 'true' || process.env.IS_OFFLINE === 'true';

const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  endpoint: isOffline ? process.env.DYNAMO_ENDPOINT || 'http://localhost:8000' : undefined,
});

export const docClient = DynamoDBDocumentClient.from(client);
