import { handler } from '../handler';
import * as service from '../service';
import * as getUser from '../../../utils/getUserName';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('getAllNotes handler', () => {
  it('should return 200 with notes', async () => {
    const mockNotes = [
      { id: '1', userName: 'test', title: 'test', content: 'test', createdAt: 'now' },
    ];
    jest.spyOn(service, 'getAllNotes').mockResolvedValueOnce(mockNotes);

    jest.spyOn(getUser, 'getUserName').mockReturnValue('test name');

    const event = {
      pathParameters: { id: '123' },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ notes: mockNotes });
  });

  it('returns 500 on unexpected error', async () => {
    (service.getAllNotes as jest.Mock).mockImplementation(() => {
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
