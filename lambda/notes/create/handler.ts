import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk-core';
import { createNoteSchema } from './schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, response } from '../../utils/response';
import { createNote } from './service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let subsegment;

  try {
    const body = JSON.parse(event.body || '{}');

    const data = validate(createNoteSchema, body);

    const segment = AWSXRay.getSegment();
    if (segment) {
      subsegment = segment.addNewSubsegment('CustomLogicCreateNote');
      subsegment.addAnnotation('operation', 'createNote');
      subsegment.addMetadata('input', data);
    }

    const note = await createNote(data);

    return response(201, { message: 'Note created', note });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    return internalError(error);
  } finally {
    if (subsegment) {
      subsegment.close();
    }
  }
};
