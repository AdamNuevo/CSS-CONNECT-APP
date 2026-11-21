import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  units: integer('units').notNull(),
  description: text('description'),
  program: varchar('program', { length: 100 }).notNull(),
  yearLevel: varchar('year_level', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const facultyCourseAssignments = pgTable('faculty_course_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  semester: integer('semester').notNull(),
  section: varchar('section', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Course = typeof courses.$inferSelect;
export type FacultyCourseAssignment = typeof facultyCourseAssignments.$inferSelect;
