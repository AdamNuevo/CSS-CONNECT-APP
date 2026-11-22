import { z } from 'zod';

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must be at most 200 characters')
      .trim(),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .trim(),
    category: z.enum(['academic', 'cultural', 'sports', 'seminar', 'org', 'other']),
    location: z
      .string()
      .min(3, 'Location must be at least 3 characters')
      .max(200, 'Location must be at most 200 characters')
      .trim(),
    startsAt: z.string().datetime({ message: 'Invalid start date/time' }),
    endsAt: z.string().datetime({ message: 'Invalid end date/time' }),
    registrationDeadline: z
      .string()
      .datetime({ message: 'Invalid deadline date/time' })
      .optional()
      .nullable(),
    maxSlots: z
      .number()
      .int()
      .positive('Max slots must be a positive number')
      .optional()
      .nullable(),
  })
  .refine((d) => new Date(d.endsAt) > new Date(d.startsAt), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  });

export const registerForEventSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
});

export const scanAttendanceSchema = z.object({
  qrPayload: z.string().min(1, 'QR payload or ticket code is required').trim(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RegisterForEventInput = z.infer<typeof registerForEventSchema>;
export type ScanAttendanceInput = z.infer<typeof scanAttendanceSchema>;
