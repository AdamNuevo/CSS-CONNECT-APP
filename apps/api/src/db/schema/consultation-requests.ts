import {
  pgTable,
  uuid,
  date,
  time,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { consultationSlots } from './consultation-slots';

export const consultationStatusEnum = pgEnum('consultation_status', [
  'pending',
  'approved',
  'declined',
  'cancelled',
]);

export const consultationRequests = pgTable('consultation_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id),
  facultyId: uuid('faculty_id').notNull().references(() => users.id),
  slotId: uuid('slot_id').notNull().references(() => consultationSlots.id),
  // Specific calendar date of this consultation.
  requestedDate: date('requested_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: consultationStatusEnum('status').notNull().default('pending'),
  facultyNote: text('faculty_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// The EXCLUDE constraint preventing double-booking is added in the SQL migration.
// Drizzle does not generate EXCLUDE natively; we add it manually in the migration file:
//
//   ALTER TABLE consultation_requests
//     ADD CONSTRAINT no_double_booking
//     EXCLUDE USING gist (
//       faculty_id WITH =,
//       requested_date WITH =,
//       tsrange(
//         (requested_date || ' ' || start_time)::timestamp,
//         (requested_date || ' ' || end_time)::timestamp
//       ) WITH &&
//     )
//     WHERE (status NOT IN ('declined', 'cancelled'));

export type ConsultationRequest = typeof consultationRequests.$inferSelect;
