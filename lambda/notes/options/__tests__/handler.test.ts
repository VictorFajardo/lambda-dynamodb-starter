import { handler } from '../handler';

describe('createNote handler', () => {
  it('should return 204', async () => {
    const response = await handler();

    expect(response.statusCode).toBe(204);
    expect(JSON.parse(response.body).note).toBeUndefined();
  });
});
