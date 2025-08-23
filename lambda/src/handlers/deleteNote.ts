import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { deleteNoteSchema } from '../schemas/deleteNoteSchema';
import { validate, ValidationError } from '../utils/validate';
import { badRequest, internalError, notFound, ok } from '../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
     return badRequest('Note ID is required');
  }

  try {
    validate(deleteNoteSchema, { id });

    const command = new DeleteCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id },
      ConditionExpression: 'attribute_exists(id)',
    });

    await docClient.send(command);

    return ok({ message: `Note ${id} deleted` });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    if (error.name === 'ConditionalCheckFailedException') {
      return notFound();
    }

    return internalError();
  }
};
