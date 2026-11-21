import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

export const evaluationPeriods = pgTable('evaluation_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  semester: integer('semester').notNull(),
  label: varchar('label', { length: 100 }).notNull(),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  closesAt: timestamp('closes_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const evaluationSubmissions = pgTable('evaluation_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  periodId: uuid('period_id').notNull().references(() => evaluationPeriods.id),
  studentId: uuid('student_id').notNull().references(() => users.id),
  facultyId: uuid('faculty_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  // Ratings stored as a JSON object keyed by criterion name, values 1–5.
  ratings: text('ratings').notNull(),
  comments: text('comments'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type EvaluationPeriod = typeof evaluationPeriods.$inferSelect;
export type EvaluationSubmission = typeof evaluationSubmissions.$inferSelect;
