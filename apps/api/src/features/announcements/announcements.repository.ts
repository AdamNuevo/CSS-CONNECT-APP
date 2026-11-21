import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { announcements, users, organizations } from '../../db/schema/index.js';

export interface AnnouncementFilters {
  audience?: 'all' | 'dean' | 'ccs' | 'org';
  limit?: number;
  offset?: number;
}

export const announcementsRepository = {
  async findMany(filters: AnnouncementFilters) {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const conditions = [];
    if (filters.audience && filters.audience !== 'all') {
      conditions.push(eq(announcements.audience, filters.audience));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        body: announcements.body,
        audience: announcements.audience,
        organizationId: announcements.organizationId,
        isPinned: announcements.isPinned,
        publishedAt: announcements.publishedAt,
        expiresAt: announcements.expiresAt,
        createdBy: announcements.createdBy,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        authorName: users.firstName,
        authorLastName: users.lastName,
        orgName: organizations.name,
        orgAcronym: organizations.acronym,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdBy, users.id))
      .leftJoin(organizations, eq(announcements.organizationId, organizations.id))
      .where(whereClause)
      .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt), desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ value: count() })
      .from(announcements)
      .where(whereClause);

    return {
      items: rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        audience: r.audience,
        organizationId: r.organizationId,
        isPinned: r.isPinned,
        publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        authorName: r.authorName ? `${r.authorName} ${r.authorLastName ?? ''}`.trim() : 'CCS Administration',
        organizationName: r.orgAcronym ?? r.orgName ?? null,
      })),
      total: Number(totalResult?.value ?? 0),
    };
  },

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    return row ?? null;
  },

  async create(data: {
    title: string;
    body: string;
    audience: 'all' | 'dean' | 'ccs' | 'org';
    organizationId?: string | null;
    isPinned?: boolean;
    createdBy: string;
  }) {
    const [created] = await db
      .insert(announcements)
      .values({
        title: data.title,
        body: data.body,
        audience: data.audience,
        organizationId: data.organizationId ?? null,
        isPinned: data.isPinned ?? false,
        publishedAt: new Date(),
        createdBy: data.createdBy,
      })
      .returning();

    return created;
  },
};
