import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

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

const items = [
  {
    id: 1,
    content: "My first note!",
  },
  {
    id: 2,
    content: "Another user's note...",
  },
  {
    id: 3,
    content: "A note with emojis 👀😁✨",
  },
  {
    id: 4,
    content: "⚙ Edit me!",
  },
  {
    id: 5,
    content: "🧨 Delete me!",
  },
];

async function seed() {
  console.log(`Seeding ${items.length} items into ${tableName}...`);
  const time = Number(Date.now().toString());

  for (const { id, content } of items) {
    const strId = String(time + id);
    try {
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            content,
            id: strId,
            createdAt: new Date().toISOString(),
          },
        })
      );
      console.log(`Inserted: ${strId} | ${content}`);
    } catch (err) {
      console.error(`Failed to insert ${strId}:`, err);
    }
  }

  console.log('✅ Seeding complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
