import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const deleteNote = async (id: string) => {
  const command = new DeleteCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id },
    ConditionExpression: 'attribute_exists(id)',
  });

  await docClient.send(command);

  return { id };
};
