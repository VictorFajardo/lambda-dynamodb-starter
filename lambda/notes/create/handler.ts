import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createNote } from './service';
import { createNoteSchema } from './schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, response } from '../../utils/response';
import { withSubsegment } from '../../utils/xray';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');

    const data = validate(createNoteSchema, body);

    return await withSubsegment('CustomLogicCreateNote', async (sub) => {
      sub?.addAnnotation('operation', 'createNote');
      sub?.addMetadata('input', data);

      const note = await createNote(data);

      return response(201, { message: 'Note created', note });
    });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    return internalError(error);
  }
};
