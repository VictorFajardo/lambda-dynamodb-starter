import { APIGatewayProxyResult } from 'aws-lambda';
import { internalError, ok } from '../../utils/response';
import { getAllNotes } from './get-all.service';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const notes = await getAllNotes();

    return ok({ notes });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return internalError();
  }
};
