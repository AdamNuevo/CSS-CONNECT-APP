import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const eventCategoryEnum = pgEnum('event_category', [
  'academic',
  'cultural',
  'sports',
  'seminar',
  'org',
  'other',
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: eventCategoryEnum('category').notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
  maxSlots: integer('max_slots'),
  isPublished: boolean('is_published').notNull().default(false),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Event = typeof events.$inferSelect;
