import { response, ok, badRequest, notFound, internalError, headers } from '../response';

describe('response utilities', () => {
  it('response returns correct structure', () => {
    const res = response(201, { success: true });
    expect(res.statusCode).toBe(201);
    expect(res.headers).toEqual(headers);
    expect(JSON.parse(res.body)).toEqual({ success: true });
  });

  it('ok returns 200 with data', () => {
    const res = ok({ data: 'hello' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ data: 'hello' });
  });

  it('badRequest returns 400 with message and optional errors', () => {
    const res = badRequest('Invalid input', { content: ['Required'] });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Invalid input',
      errors: { content: ['Required'] },
    });
  });

  it('badRequest returns 400 with message and undefined errors', () => {
    const res = badRequest('Just a message');
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Just a message',
      errors: undefined,
    });
  });

  it('notFound returns 404 with default message', () => {
    const res = notFound();
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ message: 'Note not found' });
  });

  it('notFound returns 404 with custom message', () => {
    const res = notFound('Custom message');
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ message: 'Custom message' });
  });

  it('internalError returns 500 with generic message', () => {
    const mockError = new Error('Database not found!');
    const res = internalError(mockError);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Internal Server Error',
      error: 'Database not found!',
    });
  });

  it('internalError returns 500 with unknow message', () => {
    const res = internalError();
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Internal Server Error',
      error: 'An unknown error occurred',
    });
  });
});
