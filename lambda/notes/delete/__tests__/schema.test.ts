import { deleteNoteSchema } from '../schema';
import { z } from 'zod';

describe('deleteNoteSchema', () => {
  it('validates with a valid id', () => {
    expect(() => deleteNoteSchema.parse({ id: '123' })).not.toThrow();
  });

  it('fails with missing id', () => {
    expect(() => deleteNoteSchema.parse({})).toThrow(z.ZodError);
  });
});
