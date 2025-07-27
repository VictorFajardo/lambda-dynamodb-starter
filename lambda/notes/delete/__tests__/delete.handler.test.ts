import { handler } from '../delete.handler';
import * as service from '../delete.service';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('../delete.service');

describe('deleteNote handler', () => {
  it('should return 200 on successful delete', async () => {
    jest.spyOn(service, 'deleteNote').mockResolvedValueOnce({ id: '123' });

    const event = {
      pathParameters: { id: '123' },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('Note 123 deleted');
  });

  it('should return 400 if id missing', async () => {
    const event = {} as unknown as APIGatewayProxyEvent;
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });

  it('should return 400 on validation error', async () => {
    [JSON.stringify({}), undefined].map(async () => {
      const event = {
        pathParameters: { id: 123 },
      } as unknown as APIGatewayProxyEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });
  });

  it('returns 404 when deleteNote throws ConditionalCheckFailedException', async () => {
    const error = new Error('Note not found');
    error.name = 'ConditionalCheckFailedException';

    jest.spyOn(service, 'deleteNote').mockRejectedValueOnce(error);

    const event = {
      pathParameters: { id: 'does-not-exist' },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toMatch('Note with id "does-not-exist" not found');
  });

  it('returns 500 on unexpected error', async () => {
    jest.spyOn(service, 'deleteNote').mockImplementation(() => {
      throw new Error('DB is down');
    });

    const event = {
      pathParameters: { id: '123' },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Internal Server Error');
  });
});
