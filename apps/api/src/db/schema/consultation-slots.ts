import {
  pgTable,
  uuid,
  time,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { dayOfWeekEnum } from './schedule';

// A professor's recurring weekly availability block.
export const consultationSlots = pgTable('consultation_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  day: dayOfWeekEnum('day').notNull(),
  startTime: time('start_time').notNull(),
  // Each slot is exactly 30 minutes.
  endTime: time('end_time').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ConsultationSlot = typeof consultationSlots.$inferSelect;
