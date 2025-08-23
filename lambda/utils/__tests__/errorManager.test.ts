import { handleError } from '../errorManager';
import { ValidationError } from '../validate';
import { ZodError } from 'zod';

describe('handleError', () => {
  it('should return badRequest for ValidationError', () => {
    const error = new ValidationError('Invalid input' as unknown as ZodError<unknown>);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    error.details = {
      flatten: () => ({ fieldErrors: { title: ['Required'] } }),
    };

    const result = handleError(error);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Validation failed',
      errors: { title: ['Required'] },
    });
  });

  it('should return notFound for ConditionalCheckFailedException', () => {
    const error = new Error('not found');
    error.name = 'ConditionalCheckFailedException';

    const result = handleError(error, { id: '123' });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Resource with id "123" not found');
  });

  it('should return unauthorized for NotAuthorizedException', () => {
    const error = new Error('no auth');
    error.name = 'NotAuthorizedException';

    const result = handleError(error);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body).message).toBe('You are not authorized to perform this action');
  });

  it('should return forbidden for AccessDeniedException', () => {
    const error = new Error('denied');
    error.name = 'AccessDeniedException';

    const result = handleError(error);

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body).message).toBe('Access denied for this resource');
  });

  it('should return conflict for ResourceConflictException', () => {
    const error = new Error('duplicate');
    error.name = 'ResourceConflictException';

    const result = handleError(error);

    expect(result.statusCode).toBe(409);
    expect(JSON.parse(result.body).message).toBe('duplicate');
  });

  it('should return internalError for unknown errors', () => {
    const error = new Error('unexpected');
    const result = handleError(error);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal Server Error',
      error: 'unexpected',
    });
  });
});
