import { APIGatewayProxyEvent } from 'aws-lambda';

export function getUserName(event: APIGatewayProxyEvent): string {
  return event.requestContext.authorizer?.claims?.name ?? 'Unknown User';
}
