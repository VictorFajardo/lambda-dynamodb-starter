import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.AWS_SAM_LOCAL === 'true' || process.env.IS_OFFLINE === 'true';

const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  endpoint: isOffline ? 'http://host.docker.internal:8000' : undefined,
});

export const docClient = DynamoDBDocumentClient.from(client);
