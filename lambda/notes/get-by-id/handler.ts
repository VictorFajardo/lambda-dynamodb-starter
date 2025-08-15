import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk-core';
import { getNoteByIdSchema } from './schema';
import { validate, ValidationError } from '../../utils/validate';
import { badRequest, internalError, notFound, ok } from '../../utils/response';
import { getNoteById } from './service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  let subsegment;

  if (!id) {
    return badRequest('Note ID is required');
  }

  try {
    validate(getNoteByIdSchema, { id });

    const segment = AWSXRay.getSegment();
    if (segment) {
      subsegment = segment.addNewSubsegment('CustomLogicGetByIdNote');
      subsegment.addAnnotation('operation', 'getByIdNote');
      subsegment.addMetadata('input', id);
    }

    const note = await getNoteById(id);

    if (!note) {
      return notFound(`Note with id "${id}" not found`);
    }

    return ok({ note });
  } catch (error) {
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
