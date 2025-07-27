import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const deleteNote = async (id: string) => {
  const command = new DeleteCommand({
    TableName: process.env.NOTES_TABLE,
    Key: { id },
    ConditionExpression: 'attribute_exists(id)',
  });

  const result = await docClient.send(command);

  console.log(`🚀 deleteNote -> ${result}`);

  return { id };
};
