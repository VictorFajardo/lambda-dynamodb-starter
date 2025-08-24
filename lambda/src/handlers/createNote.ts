import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { createNoteSchema } from '../schemas/createNoteSchema';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');

    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        }),
      };
    }

    const note = {
      ...parsed.data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.NOTES_TABLE,
        Item: note,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Note created', note }),
    };
  } catch (error) {
    console.error('Create Note Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
