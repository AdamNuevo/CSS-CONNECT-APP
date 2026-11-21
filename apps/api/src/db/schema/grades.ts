import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

export const gradePeriodEnum = pgEnum('grade_period', ['Prelims', 'Midterms', 'Finals']);

export const grades = pgTable('grades', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  semester: integer('semester').notNull(),
  period: gradePeriodEnum('period').notNull(),
  // Philippine grading scale: 1.00 (highest) to 5.00 (failing), stored with 2 decimal places.
  grade: numeric('grade', { precision: 4, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Grade = typeof grades.$inferSelect;
