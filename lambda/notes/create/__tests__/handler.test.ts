import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../handler';
import * as service from '../service';
import * as getUser from '../../../utils/getUserName';

jest.mock('../service');

describe('createNote handler', () => {
  it('should return 201 with note data', async () => {
    const mockNote = {
      userName: 'test name',
      id: '123',
      title: 'test',
      content: 'test',
      createdAt: '2025-07-27T00:00:00Z',
    };

    jest.spyOn(service, 'createNote').mockResolvedValueOnce(mockNote);

    jest.spyOn(getUser, 'getUserName').mockReturnValue('test name');

    const event = {
      body: JSON.stringify({ title: 'test', content: 'test' }),
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body).note).toEqual(mockNote);

    expect(service.createNote).toHaveBeenCalledWith(
      { title: 'test', content: 'test' },
      'test name'
    );
  });

  it('should return 400 on validation error', async () => {
    [JSON.stringify({}), undefined].map(async (body) => {
      const event = {
        body,
      } as unknown as APIGatewayProxyEvent;

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });
  });

  it('returns 500 when body is invalid JSON', async () => {
    const event = {
      body: '{"invalidJson": true,',
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal Server Error',
      error: 'Expected double-quoted property name in JSON at position 21',
    });
  });
});
