import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'registered',
  'attended',
  'absent',
]);

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  // QR payload is a signed JWT containing the registration ID.
  qrPayload: text('qr_payload').notNull(),
  attendanceStatus: attendanceStatusEnum('attendance_status').notNull().default('registered'),
  attendedAt: timestamp('attended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
