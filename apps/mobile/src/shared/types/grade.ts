export type GradePeriod = 'Prelims' | 'Midterms' | 'Finals';

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  academicYear: string;
  semester: 1 | 2;
  period: GradePeriod;
  /** Philippine grading scale: 1.00 (highest) – 5.00 (failing). Null if not yet released. */
  grade: string | null; // numeric stored as string from DB
  createdAt: string;
  updatedAt: string;
}
