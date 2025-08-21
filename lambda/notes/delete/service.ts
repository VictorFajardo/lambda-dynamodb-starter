import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteNote = async (id: string, _userName: string) => {
  //TODO
  /*
  / Use userName to enforce delete notes by user auth only
  */

  const command = new DeleteCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id },
    ConditionExpression: 'attribute_exists(id)',
  });

  await docClient.send(command);

  return { id };
};
