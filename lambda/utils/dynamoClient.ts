import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
export const docClient = DynamoDBDocumentClient.from(client);
