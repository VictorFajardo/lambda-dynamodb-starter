import { handler } from '../handler';
import * as service from '../service';

describe('getAllNotes handler', () => {
  it('should return 200 with notes', async () => {
    const mockNotes = [{ id: '1', content: 'test', createdAt: 'now' }];
    jest.spyOn(service, 'getAllNotes').mockResolvedValueOnce(mockNotes);

    const response = await handler();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ notes: mockNotes });
  });

  it('returns 500 on unexpected error', async () => {
    (service.getAllNotes as jest.Mock).mockImplementation(() => {
      throw new Error('DB is down');
    });

    const result = await handler();

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Internal Server Error');
  });
});
