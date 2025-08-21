import { createNoteSchema } from '../schema';
import { z } from 'zod';

describe('createNoteSchema', () => {
  it('validates correct data', () => {
    const data = { title: 'My title', content: 'My note' };
    expect(() => createNoteSchema.parse(data)).not.toThrow();
  });

  it('fails with missing content', () => {
    const data = {};
    expect(() => createNoteSchema.parse(data)).toThrow(z.ZodError);
  });

  it('fails with empty string', () => {
    const data = { title: '', content: '' };
    expect(() => createNoteSchema.parse(data)).toThrow(z.ZodError);
  });

  it('fails with non-string content', () => {
    const data = { title: 123, content: 123 };
    expect(() => createNoteSchema.parse(data)).toThrow(z.ZodError);
  });
});
