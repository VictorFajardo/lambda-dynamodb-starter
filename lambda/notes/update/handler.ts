import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { updateNoteSchema } from './schema';
import { validate } from '../../utils/validate';
import { badRequest, noContent } from '../../utils/response';
import { updateNote } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const { content } = validate(updateNoteSchema, body);

    return await withSubsegment('CustomLogicUpdateNote', async (sub) => {
      sub?.addAnnotation('operation', 'updateNote');
      sub?.addMetadata('input', content);

      await updateNote(id, content);

      return noContent();
    });
  } catch (error: unknown) {
    return handleError(error, { id });
  }
};
