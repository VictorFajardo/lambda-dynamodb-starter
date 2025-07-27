import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createNoteSchema } from './create.schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, response } from '../../utils/response';
import { createNote } from './create.service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');

    const data = validate(createNoteSchema, body);

    const note = await createNote(data);

    return response(201, { message: 'Note created', note });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    return internalError();
  }
};
