import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.AWS_SAM_LOCAL === 'true' || process.env.IS_OFFLINE === 'true';

// Create the raw DynamoDB client
const rawClient = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  endpoint: isOffline ? 'http://host.docker.internal:8000' : undefined,
});

// Capture the client with X-Ray for tracing
const tracedClient = AWSXRay.captureAWSv3Client(rawClient);

export const docClient = DynamoDBDocumentClient.from(tracedClient);
