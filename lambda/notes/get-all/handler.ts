import { APIGatewayProxyResult } from 'aws-lambda';
import { internalError, ok } from '../../utils/response';
import { getAllNotes } from './service';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const notes = await getAllNotes();

    return ok({ notes });
  } catch (error: unknown) {
    return internalError(error);
  }
};
