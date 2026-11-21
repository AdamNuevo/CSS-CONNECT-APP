import { db } from '../../db/client';
import { announcements } from '../../db/schema/announcements';
import { eq, and } from 'drizzle-orm';

export async function getOrgAnnouncements(orgId: string) {
  return db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.audience, 'org'),
        eq(announcements.organizationId, orgId),
      )
    )
    .orderBy(announcements.createdAt);
}

export async function createOrgAnnouncement(input: {
  title: string;
  body: string;
  isPinned: boolean;
  expiresAt?: string;
  organizationId: string;
  createdBy: string;
}) {
  const rows = await db
    .insert(announcements)
    .values({
      title: input.title,
      body: input.body,
      audience: 'org',
      organizationId: input.organizationId,
      isPinned: input.isPinned,
      publishedAt: new Date(),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      createdBy: input.createdBy,
    })
    .returning();
  return rows[0];
}

export async function deleteOrgAnnouncement(announcementId: string, orgId: string) {
  const rows = await db
    .delete(announcements)
    .where(
      and(
        eq(announcements.id, announcementId),
        eq(announcements.organizationId, orgId),
      )
    )
    .returning();
  return rows[0] ?? null;
}
