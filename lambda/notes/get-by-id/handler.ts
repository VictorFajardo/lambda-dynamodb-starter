import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getNoteByIdSchema } from './schema';
import { validate } from '../../utils/validate';
import { badRequest, notFound, ok } from '../../utils/response';
import { getNoteById } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';
import { getUserName } from '../../utils/getUserName';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    validate(getNoteByIdSchema, { id });

    const userName = getUserName(event);

    return await withSubsegment('CustomLogicGetByIdNote', async (sub) => {
      sub?.addAnnotation('operation', 'getByIdNote');
      sub?.addAnnotation('userName', userName);
      sub?.addMetadata('input', id);

      const note = await getNoteById(id);

      if (!note) {
        return notFound(`Note with id "${id}" not found`);
      }

      return ok({ note });
    });
  } catch (error) {
    return handleError(error, { id });
  }
};
