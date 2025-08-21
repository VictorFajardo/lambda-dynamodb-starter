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
    title: 'The One Ring...',
    content:
      '"Three Rings for the Elven-kings under the sky, Seven for the Dwarf-lords in their halls of stone, Nine for Mortal Men doomed to die, One for the Dark Lord on his dark throne In the Land of Mordor where the shadows lie. One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them"',
    userName: 'Demo User',
  },
  {
    id: 2,
    title: 'He is not a tame lion',
    content:
      '"Wrong will be right, when Aslan comes in sight, At the sound of his roar, sorrows will be no more, When he bares his teeth, winter meets its death, And when he shakes his mane, we shall have spring again"',
    userName: 'Demo User',
  },
  {
    id: 3,
    title: 'A simple title...',
    content: '...for a note with emojis 👀😁✨',
    userName: 'Victor Fajardo',
  },
  {
    id: 4,
    title: 'Foundation',
    content: '"Never let your sense of morals prevent you from doing what is right"',
    userName: 'Demo User',
  },

  {
    id: 5,
    title: '🧨 Delete me!',
    content:
      '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."',
    userName: 'Victor Fajardo',
  },
];

async function seed() {
  console.log(`Seeding ${items.length} items into ${tableName}...`);
  const time = Number(Date.now().toString());

  for (const { id, title, content, userName } of items) {
    const strId = String(time + id);
    try {
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            title,
            content,
            userName,
            id: strId,
            createdAt: new Date().toISOString(),
          },
        })
      );
      console.log(`Inserted: ${strId} | ${title}| ${content}`);
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
