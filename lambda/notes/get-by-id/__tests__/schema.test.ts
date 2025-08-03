import { getNoteByIdSchema } from '../schema';
import { z } from 'zod';

describe('getNoteByIdSchema', () => {
  it('validates with a valid id', () => {
    expect(() => getNoteByIdSchema.parse({ id: '123' })).not.toThrow();
  });

  it('fails with missing id', () => {
    expect(() => getNoteByIdSchema.parse({})).toThrow(z.ZodError);
  });
});
