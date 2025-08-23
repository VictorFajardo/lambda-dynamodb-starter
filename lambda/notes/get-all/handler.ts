import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../../utils/response';
import { getAllNotes } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';
import { getUserName } from '../../utils/getUserName';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userName = getUserName(event);

    return await withSubsegment('CustomLogicGetAllNotes', async (sub) => {
      sub?.addAnnotation('operation', 'getAllNotes');
      sub?.addAnnotation('userName', userName);

      const notes = await getAllNotes();

      return ok({ notes });
    });
  } catch (error: unknown) {
    return handleError(error);
  }
};
