import { z } from 'zod';

export const submitEvaluationSchema = z.object({
  periodId: z.string().uuid('Invalid period ID'),
  facultyId: z.string().uuid('Invalid faculty ID'),
  courseId: z.string().uuid('Invalid course ID'),
  ratings: z.record(
    z.string(),
    z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5')
  ),
  comments: z.string().max(1000, 'Comments cannot exceed 1000 characters').optional().nullable(),
});

export type SubmitEvaluationInput = z.infer<typeof submitEvaluationSchema>;
