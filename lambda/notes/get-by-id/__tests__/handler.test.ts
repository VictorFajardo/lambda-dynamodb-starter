import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../handler';
import * as service from '../service';

jest.mock('../get-by-id.service');

describe('getNoteById handler', () => {
  it('should return 200 with note if found', async () => {
    const mockNote = { id: '1', content: 'test', createdAt: 'now' };
    jest.spyOn(service, 'getNoteById').mockResolvedValueOnce(mockNote);

    const event = { pathParameters: { id: '1' } } as unknown as APIGatewayProxyEvent;
    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ note: mockNote });
  });

  it('should return 400 if id missing', async () => {
    const event = {} as unknown as APIGatewayProxyEvent;
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });

  it('should return 404 if not found', async () => {
    jest.spyOn(service, 'getNoteById').mockResolvedValueOnce(undefined);

    const event = { pathParameters: { id: '999' } } as unknown as APIGatewayProxyEvent;
    const response = await handler(event);

    expect(response.statusCode).toBe(404);
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

  it('returns 500 on unexpected error', async () => {
    jest.spyOn(service, 'getNoteById').mockImplementation(() => {
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
