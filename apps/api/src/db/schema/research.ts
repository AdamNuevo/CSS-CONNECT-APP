import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const researchStudies = pgTable(
  'research_studies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    authors: text('authors').notNull(),
    abstract: text('abstract').notNull(),
    keywords: text('keywords').notNull(),
    program: varchar('program', { length: 100 }).notNull(),
    academicYear: varchar('academic_year', { length: 20 }).notNull(),
    // tsvector column for full-text search; populated by a PostgreSQL trigger.
    // The trigger and GIN index are created manually in the migration SQL.
    searchVector: text('search_vector'),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    searchVectorIdx: index('research_search_vector_idx').on(table.searchVector),
  })
);

export type ResearchStudy = typeof researchStudies.$inferSelect;
