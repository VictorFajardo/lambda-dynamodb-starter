import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { getNoteByIdSchema } from '../schemas/getNoteByIdSchema';
import { validate, ValidationError } from '../utils/validate';

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
    const data = validate(getNoteByIdSchema, { id });

    const command = new GetCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: data.id },
    });

    const result = await docClient.send(command);

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
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error.message,
          errors: error.details.flatten().fieldErrors,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
