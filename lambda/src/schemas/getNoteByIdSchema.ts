import { z } from 'zod';

export const getNoteByIdSchema = z.object({
    id: z.string().min(1, 'Note ID is required'),
});