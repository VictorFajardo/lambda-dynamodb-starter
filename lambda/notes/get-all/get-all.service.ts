import { ScanCommand } from '@aws-sdk/client-dynamodb';

import { docClient } from '../../utils/dynamoClient';

export const getAllNotes = async () => {
  const command = new ScanCommand({ TableName: process.env.NOTES_TABLE });

  const result = await docClient.send(command);

  const notes =
    result.Items?.map((item) => ({
      id: item.id.S,
      content: item.content.S,
      createdAt: item.createdAt.S,
    })) || [];

  return notes;
};
