import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk-core';
import { updateNoteSchema } from './schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, notFound, ok } from '../../utils/response';
import { updateNote } from './service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  let subsegment;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const { content } = validate(updateNoteSchema, body);

    const segment = AWSXRay.getSegment();
    if (segment) {
      subsegment = segment.addNewSubsegment('CustomLogicUpdateNote');
      subsegment.addAnnotation('operation', 'updateNote');
      subsegment.addMetadata('input', content);
    }

    const result = await updateNote(id, content);

    return ok({ message: 'Note updated', note: result });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details.flatten().fieldErrors);
    }

    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return notFound(`Note with id "${id}" not found`);
    }

    return internalError(error);
  } finally {
    if (subsegment) {
      subsegment.close();
    }
  }
};
