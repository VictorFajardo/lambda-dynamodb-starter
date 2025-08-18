import { APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../../utils/response';
import { getAllNotes } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    return await withSubsegment('CustomLogicGetAllNotes', async (sub) => {
      sub?.addAnnotation('operation', 'getAllNotes');

      const notes = await getAllNotes();

      return ok({ notes });
    });
  } catch (error: unknown) {
    return handleError(error);
  }
};
