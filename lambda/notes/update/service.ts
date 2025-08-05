import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const updateNote = async (id: string, content: string) => {
  const command = new UpdateCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set content = :content',
    ExpressionAttributeValues: {
      ':content': content,
    },
    ConditionExpression: 'attribute_exists(id)',
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);

  return result.Attributes;
};
