import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { updateNoteSchema } from '../schemas/updateNoteSchema';
import { validate, ValidationError } from '../utils/validate';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const noteId = event.pathParameters?.id;

    if (!noteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Note ID is required' }),
      };
    }

    const body = JSON.parse(event.body || '{}');

    const { content } = validate(updateNoteSchema, body);

    const command = new UpdateCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: noteId },
      UpdateExpression: 'set content = :content',
      ExpressionAttributeValues: {
        ':content': content,
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Note updated', note: result.Attributes }),
    };
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error.message,
          errors: error.details.flatten().fieldErrors,
        }),
      };
    }

    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Note not found' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
