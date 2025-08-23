import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const updateNote = async (
  id: string,
  data: { title: string; content: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userName: string
) => {
  //TODO
  /*
  / Use userName to enforce update notes by user auth only
  */

  const command = new UpdateCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET title = :title, content = :content',
    ExpressionAttributeValues: {
      ':title': data.title,
      ':content': data.content,
    },
    ConditionExpression: 'attribute_exists(id)',
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);

  return result.Attributes;
};
