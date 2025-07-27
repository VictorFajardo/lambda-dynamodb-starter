import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteNoteSchema } from './schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, notFound, ok } from '../../utils/response';
import { deleteNote } from './service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    validate(deleteNoteSchema, { id });

    const result = await deleteNote(id);

    return ok({ message: `Note ${result.id} deleted` });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return notFound(`Note with id "${id}" not found`);
    }

    return internalError();
  }
};
