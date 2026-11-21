import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { organizations } from './organizations';

export const announcementAudienceEnum = pgEnum('announcement_audience', [
  'all',
  'dean',
  'ccs',
  'org',
]);

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  body: text('body').notNull(),
  audience: announcementAudienceEnum('audience').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  isPinned: boolean('is_pinned').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Announcement = typeof announcements.$inferSelect;
