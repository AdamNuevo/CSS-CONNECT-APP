import { z } from 'zod';

export const applyToOrgSchema = z.object({
  applicationNote: z.string().max(500).optional(),
});
export type ApplyToOrgInput = z.infer<typeof applyToOrgSchema>;

export const reviewApplicationSchema = z.object({
  status: z.enum(['active', 'declined']),
  reviewNote: z.string().max(500).optional(),
});
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;

export const postOrgAnnouncementSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1),
  isPinned: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().optional(),
});
export type PostOrgAnnouncementInput = z.infer<typeof postOrgAnnouncementSchema>;
