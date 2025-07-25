import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing note ID in path' }),
    };
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.NOTES_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Note not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ note: result.Item }),
    };
  } catch (error) {
    console.error('Error fetching note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
