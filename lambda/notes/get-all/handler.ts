import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../../utils/response';
import { getAllNotes } from './service';
import { withSubsegment } from '../../utils/xray';
import { handleError } from '../../utils/errorManager';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Access Cognito claims
  const claims = event.requestContext.authorizer?.claims;
  console.log('Cognito Claims:', claims);

  // Example: get email
  const userEmail = claims?.email;
  console.log('Authenticated user email:', userEmail);

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
