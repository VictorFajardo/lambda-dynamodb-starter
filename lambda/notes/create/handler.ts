import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createNote } from './service';
import { createNoteSchema } from './schema';
import { validate } from '../../utils/validate';
import { created } from '../../utils/response';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');

    const data = validate(createNoteSchema, body);


    return await withSubsegment('CustomLogicCreateNote', async (sub) => {
      sub?.addAnnotation('operation', 'createNote');
      sub?.addMetadata('input', data);

      const note = await createNote(data);

      return created({ message: 'Note created', note });
    });
  } catch (error: unknown) {
    return handleError(error);
  }
};
