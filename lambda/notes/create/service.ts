import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const createNote = async (data: { content: string }) => {
  const note = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: note,
  });

  await docClient.send(command);

  return note;
};
