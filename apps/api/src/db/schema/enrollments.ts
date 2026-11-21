import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  semester: integer('semester').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Enrollment = typeof enrollments.$inferSelect;
