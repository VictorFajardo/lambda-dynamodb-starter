import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk-core';
import { deleteNoteSchema } from './schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, notFound, ok } from '../../utils/response';
import { deleteNote } from './service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  let subsegment;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    validate(deleteNoteSchema, { id });

    const segment = AWSXRay.getSegment();
    if (segment) {
      subsegment = segment.addNewSubsegment('CustomLogicDeleteNote');
      subsegment.addAnnotation('operation', 'deleteNote');
      subsegment.addMetadata('input', id);
    }

    const result = await deleteNote(id);

    return ok({ message: `Note ${result.id} deleted` });
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
