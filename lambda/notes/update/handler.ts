import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { updateNoteSchema } from './schema';
import { validate } from '../../utils/validate';
import { badRequest, created } from '../../utils/response';
import { updateNote } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';
import { getUserName } from '../../utils/getUserName';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const data = validate(updateNoteSchema, { ...body, id });

    const userName = getUserName(event);

    return await withSubsegment('CustomLogicUpdateNote', async (sub) => {
      sub?.addAnnotation('operation', 'updateNote');
      sub?.addAnnotation('userName', userName);
      sub?.addMetadata('input', data);

      const note = await updateNote(id, data, userName);

      return created({ message: 'Note updated', note });
    });
  } catch (error: unknown) {
    return handleError(error, { id });
  }
};
