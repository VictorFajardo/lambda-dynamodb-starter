import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';
import { createNoteSchema } from '../schemas/createNoteSchema';
import { validate, ValidationError } from '../utils/validate';
import { badRequest, internalError, response } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');

  try {
    const data = validate(createNoteSchema, body);

    const note = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: process.env.NOTES_TABLE,
      Item: note,
    });

    await docClient.send(command);

    return response(201, { message: 'Note created', note });
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    return internalError();
  }
};
