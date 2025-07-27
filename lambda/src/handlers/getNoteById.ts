import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { getNoteByIdSchema } from '../schemas/getNoteByIdSchema';
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
    const data = validate(getNoteByIdSchema, { id });

    const command = new GetCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: data.id },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return notFound();
    }

    return ok({ note: result.Item });
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    return internalError();
  }
};
