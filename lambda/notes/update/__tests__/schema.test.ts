import { updateNoteSchema } from '../schema';
import { z } from 'zod';

describe('updateNoteSchema', () => {
  it('passes with valid content', () => {
    expect(() =>
      updateNoteSchema.parse({ id: '123', title: 'Updated title', content: 'Updated content' })
    ).not.toThrow();
  });

  it('fails with empty content', () => {
    expect(() => updateNoteSchema.parse({ id: '', title: '', content: '' })).toThrow(z.ZodError);
  });
});
