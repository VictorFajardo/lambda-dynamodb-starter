import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { updateNoteSchema } from '../schemas/updateNoteSchema';
import { validate, ValidationError } from '../utils/validate';
import { badRequest, internalError, notFound, ok } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const noteId = event.pathParameters?.id;

    if (!noteId) {
      return badRequest('Note ID is required');
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

    return ok({ message: 'Note updated', note: result.Attributes });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return notFound();
    }

    return internalError();
  }
};
