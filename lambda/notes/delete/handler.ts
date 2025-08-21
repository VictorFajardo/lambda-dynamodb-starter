import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteNoteSchema } from './schema';
import { validate } from '../../utils/validate';
import { badRequest, noContent } from '../../utils/response';
import { deleteNote } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';
import { getUserName } from '../../utils/getUserName';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    validate(deleteNoteSchema, { id });

    const userName = getUserName(event);

    return await withSubsegment('CustomLogicDeleteNote', async (sub) => {
      sub?.addAnnotation('operation', 'deleteNote');
      sub?.addAnnotation('userName', userName);
      sub?.addMetadata('input', id);

      await deleteNote(id, userName);

      return noContent();
    });
  } catch (error: unknown) {
    return handleError(error, { id });
  }
};
