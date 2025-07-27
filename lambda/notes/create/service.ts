import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const createNote = async (data: { content: string }) => {
  const note = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: process.env.NOTES_TABLE,
    Item: note,
  });

  const result = await docClient.send(command);

  console.log(`🚀 createNote -> ${result}`);

  return note;
};
