import { ZodSchema, ZodError } from 'zod';

export const validate = <T>(schema: ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = new ValidationError(result.error);
    throw error;
  }
  return result.data;
};

export class ValidationError extends Error {
  public readonly details: ZodError;
  constructor(error: ZodError) {
    super('Validation failed');
    this.details = error;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
