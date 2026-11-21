import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(300, 'Title cannot exceed 300 characters'),
  body: z
    .string({ required_error: 'Body is required' })
    .min(10, 'Body must be at least 10 characters'),
  audience: z.enum(['all', 'dean', 'ccs', 'org'], {
    required_error: 'Audience is required',
  }),
  organizationId: z.string().uuid().optional().nullable(),
  isPinned: z.boolean().optional().default(false),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
