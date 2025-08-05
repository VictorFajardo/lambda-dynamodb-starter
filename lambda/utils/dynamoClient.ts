import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const isRunningInDocker = process.env.AWS_SAM_LOCAL === 'true';

const resolvedEndpoint =
    process.env.DYNAMO_ENDPOINT ||
    (isRunningInDocker
        ? 'http://host.docker.internal:8000'
        : 'http://localhost:8000');

const config = {
    region: process.env.REGION || 'us-east-1',
    endpoint: resolvedEndpoint,
    credentials: resolvedEndpoint
        ? {
            accessKeyId: 'fakeMyKeyId',
            secretAccessKey: 'fakeSecretAccessKey',
        }
        : undefined,
};

export const rawClient = new DynamoDBClient(config);
export const docClient = DynamoDBDocumentClient.from(rawClient);