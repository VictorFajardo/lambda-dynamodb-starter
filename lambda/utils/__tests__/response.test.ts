import {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
} from '../response';

describe('response utils', () => {
  it('should return 200 for ok', () => {
    const res = ok({ foo: 'bar' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ foo: 'bar' });
  });

  it('should return 201 for created', () => {
    const res = created({ id: 1 });
    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body)).toEqual({ id: 1 });
  });

  it('should return 204 for noContent', () => {
    const res = noContent();
    expect(res.statusCode).toBe(204);
    expect(res.body).toBe('');
  });

  it('should return 400 for badRequest', () => {
    const res = badRequest('Invalid', { title: ['Required'] });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Invalid',
      errors: { title: ['Required'] },
    });
  });

  it('should return 401 for unauthorized', () => {
    const res = unauthorized();
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body)).toEqual({ message: 'Unauthorized' });
  });

  it('should return 403 for forbidden', () => {
    const res = forbidden();
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ message: 'Forbidden' });
  });

  it('should return 404 for notFound', () => {
    const res = notFound('Not here');
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ message: 'Not here' });
  });

  it('should return 404 with default message when no argument is passed', () => {
    const res = notFound();
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ message: 'Resource not found' });
  });

  it('should return 409 for conflict', () => {
    const res = conflict('duplicate');
    expect(res.statusCode).toBe(409);
    expect(JSON.parse(res.body)).toEqual({ message: 'duplicate' });
  });

  it('should return 409 with default message when no argument is passed', () => {
    const res = conflict();
    expect(res.statusCode).toBe(409);
    expect(JSON.parse(res.body)).toEqual({ message: 'Conflict' });
  });

  it('should return 500 for internalError with Error', () => {
    const res = internalError(new Error('boom'));
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Internal Server Error',
      error: 'boom',
    });
  });

  it('should return 500 for internalError with string', () => {
    const res = internalError('oops');
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({
      message: 'Internal Server Error',
      error: 'oops',
    });
  });
});
