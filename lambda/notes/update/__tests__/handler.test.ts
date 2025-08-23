import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../handler';
import * as service from '../service';
import * as getUser from '../../../utils/getUserName';

jest.mock('../service');

describe('updateNote handler', () => {
  it('should return 200 on successful update', async () => {
    const updatedNote = { id: '1', content: 'updated', createdAt: 'now' };
    jest.spyOn(service, 'updateNote').mockResolvedValueOnce(updatedNote);
    jest.spyOn(getUser, 'getUserName').mockReturnValue('test name');

    const event = {
      pathParameters: { id: '1' },
      body: JSON.stringify({ title: 'updated', content: 'updated' }),
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({ message: 'Note updated', note: updatedNote });
  });

  it('should return 400 if id missing', async () => {
    const event = {
      body: JSON.stringify({ content: 'updated' }),
    } as unknown as APIGatewayProxyEvent;
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });

  it('should return 400 on validation error', async () => {
    [JSON.stringify({}), undefined].map(async (body) => {
      const event = {
        pathParameters: { id: '123' },
        body,
      } as unknown as APIGatewayProxyEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });
  });

  it('returns 404 when updateNote throws ConditionalCheckFailedException', async () => {
    const error = new Error('Note not found');
    error.name = 'ConditionalCheckFailedException';

    jest.spyOn(service, 'updateNote').mockRejectedValueOnce(error);
    jest.spyOn(getUser, 'getUserName').mockReturnValue('test name');

    const event = {
      pathParameters: { id: 'does-not-exist' },
      body: JSON.stringify({ title: 'Updated title', content: 'Updated content' }),
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toMatch('Resource with id "does-not-exist" not found');
  });

  it('returns 500 when body is invalid JSON', async () => {
    const event = {
      pathParameters: { id: '123' },
      body: '{"invalidJson": true,', // malformed JSON
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal Server Error',
      error: 'Expected double-quoted property name in JSON at position 21',
    });
  });
});
