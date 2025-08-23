import { z } from 'zod';

export const updateNoteSchema = z.object({
  id: z.string().min(1, 'Note ID is required'),
  title: z.string().min(1),
  content: z.string().min(1),
});
