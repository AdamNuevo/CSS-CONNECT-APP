import { z } from 'zod';

export const createConsultationRequestSchema = z.object({
  slotId: z.string().uuid('Invalid slot ID'),
  requestedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be at most 200 characters')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .trim(),
});

export const updateConsultationStatusSchema = z.object({
  status: z.enum(['approved', 'declined', 'cancelled']),
  facultyNote: z
    .string()
    .max(500, 'Note must be at most 500 characters')
    .trim()
    .optional(),
});

export const setFacultySlotsSchema = z.object({
  slots: z.array(
    z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM'),
    })
  ),
});

export type CreateConsultationRequestInput = z.infer<typeof createConsultationRequestSchema>;
export type UpdateConsultationStatusInput = z.infer<typeof updateConsultationStatusSchema>;
export type SetFacultySlotsInput = z.infer<typeof setFacultySlotsSchema>;
