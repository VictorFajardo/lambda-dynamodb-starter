import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { getNoteByIdSchema } from '../schemas/getNoteByIdSchema';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  const parsed = getNoteByIdSchema.safeParse({ id });

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing note ID in path' }),
    };
  }

  if (!parsed.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      }),
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
