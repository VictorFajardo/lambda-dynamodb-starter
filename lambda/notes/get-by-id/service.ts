import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const getNoteById = async (id: string) => {
  const command = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id },
  });

  const result = await docClient.send(command);

  return result.Item;
};
