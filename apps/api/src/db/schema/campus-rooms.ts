import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const buildingEnum = pgEnum('building', [
  'main',
  'annex',
  'gymnasium',
  'library',
  'admin',
]);

export const campusRooms = pgTable('campus_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  building: buildingEnum('building').notNull(),
  floor: integer('floor').notNull(),
  description: text('description'),
  capacity: integer('capacity'),
  // Approximate coordinates on the campus map (relative units, not GPS coordinates).
  mapX: numeric('map_x', { precision: 8, scale: 2 }),
  mapY: numeric('map_y', { precision: 8, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CampusRoom = typeof campusRooms.$inferSelect;
