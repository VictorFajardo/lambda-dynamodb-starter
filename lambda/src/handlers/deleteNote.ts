import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Note ID is required' }),
    };
  }

  try {
    const command = new DeleteCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id },
      ConditionExpression: 'attribute_exists(id)',
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Note ${id} deleted` }),
    };
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Note not found' }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error }),
    };
  }
};
