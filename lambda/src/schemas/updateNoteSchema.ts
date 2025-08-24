import { z } from 'zod';

export const updateNoteSchema = z.object({
  content: z.string().min(1),
});
