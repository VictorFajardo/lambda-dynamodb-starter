import 'dotenv/config';
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';

const tableName = 'NotesTable';
const useProd = process.env.STAGE === 'prod';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: useProd ? undefined : 'http://host.docker.internal:8000',
  credentials: useProd
    ? undefined
    : {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
});

async function createTable() {
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ Table "${tableName}" already exists`);
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`🚀 Creating table "${tableName}"...`);
      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
          ],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST',
        })
      );
      console.log(`✅ Table "${tableName}" created successfully`);
    } else {
      console.error('❌ Error checking/creating table:', err);
    }
  }
}

createTable();
