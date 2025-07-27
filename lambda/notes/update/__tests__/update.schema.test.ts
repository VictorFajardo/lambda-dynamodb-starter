import { updateNoteSchema } from '../update.schema';
import { z } from 'zod';

describe('updateNoteSchema', () => {
  it('passes with valid content', () => {
    expect(() => updateNoteSchema.parse({ content: 'Updated note' })).not.toThrow();
  });

  it('fails with empty content', () => {
    expect(() => updateNoteSchema.parse({ content: '' })).toThrow(z.ZodError);
  });
});
