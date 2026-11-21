import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { organizations } from './organizations';

export const membershipStatusEnum = pgEnum('membership_status', [
  'pending',
  'active',
  'declined',
  'removed',
]);

export const membershipRoleEnum = pgEnum('membership_role', [
  'member',
  'officer',
  'president',
]);

export const orgMemberships = pgTable('org_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: membershipStatusEnum('status').notNull().default('pending'),
  role: membershipRoleEnum('role').notNull().default('member'),
  applicationNote: text('application_note'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewNote: text('review_note'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OrgMembership = typeof orgMemberships.$inferSelect;
