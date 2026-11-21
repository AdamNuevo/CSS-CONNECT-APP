import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from './users.js';

export const ccsMasterlist = pgTable('ccs_masterlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default('student'),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  studentNumber: varchar('student_number', { length: 20 }).unique(),
  employeeNumber: varchar('employee_number', { length: 20 }).unique(),
  program: varchar('program', { length: 100 }),
  yearLevel: varchar('year_level', { length: 20 }),
  section: varchar('section', { length: 20 }),
  isClaimed: boolean('is_claimed').notNull().default(false),
  lastEmailSentAt: timestamp('last_email_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type MasterlistEntry = typeof ccsMasterlist.$inferSelect;
export type NewMasterlistEntry = typeof ccsMasterlist.$inferInsert;
