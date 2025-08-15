import { APIGatewayProxyResult } from 'aws-lambda';
import AWSXRay from 'aws-xray-sdk-core';
import { internalError, ok } from '../../utils/response';
import { getAllNotes } from './service';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  let subsegment;

  try {
    const segment = AWSXRay.getSegment();
    if (segment) {
      subsegment = segment.addNewSubsegment('CustomLogicGetAllNotes');
      subsegment.addAnnotation('operation', 'getAllNotes');
    }

    const notes = await getAllNotes();

    return ok({ notes });
  } catch (error: unknown) {
    return internalError(error);
  } finally {
    if (subsegment) {
      subsegment.close();
    }
  }
};
