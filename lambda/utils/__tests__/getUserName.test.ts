import { getUserName } from '../getUserName';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('getUserName', () => {
  it('should return the user name if present', () => {
    const event = {
      requestContext: {
        authorizer: { claims: { name: 'John Doe' } },
      },
    } as unknown as APIGatewayProxyEvent;

    expect(getUserName(event)).toBe('John Doe');
  });

  it('should return "Unknown User" if no claims are present', () => {
    const event = {
      requestContext: { authorizer: {} },
    } as unknown as APIGatewayProxyEvent;

    expect(getUserName(event)).toBe('Unknown User');
  });
});
