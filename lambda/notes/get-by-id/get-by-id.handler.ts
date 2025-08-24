import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getNoteByIdSchema } from './get-by-id.schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, notFound, ok } from '../../utils/response';
import { getNoteById } from './get-by-id.service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    validate(getNoteByIdSchema, { id });

    const note = await getNoteById(id);

    if (!note) {
      return notFound(`Note with id "${id}" not found`);
    }

    return ok({ note });
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    return internalError();
  }
};
