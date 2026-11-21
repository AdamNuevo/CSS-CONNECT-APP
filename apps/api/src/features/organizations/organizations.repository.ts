import { db } from '../../db/client';
import { organizations, orgMemberships } from '../../db/schema';
import { eq, and, sql, ne } from 'drizzle-orm';
import { users } from '../../db/schema/users';
import type {
  Organization,
  OrgApplication,
  MyMembership,
  OrgMemberDetail,
} from '@ccs-hub/shared';

export async function listOrganizations(): Promise<Organization[]> {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      acronym: organizations.acronym,
      description: organizations.description,
      logoUrl: organizations.logoUrl,
      adviserId: organizations.adviserId,
      adviserName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
      isActive: organizations.isActive,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      memberCount: sql<number>`cast(count(${orgMemberships.id}) filter (where ${orgMemberships.status} = 'active') as int)`,
    })
    .from(organizations)
    .leftJoin(users, eq(organizations.adviserId, users.id))
    .leftJoin(orgMemberships, eq(orgMemberships.organizationId, organizations.id))
    .where(eq(organizations.isActive, true))
    .groupBy(
      organizations.id,
      users.firstName,
      users.lastName,
    );

  return rows.map((r) => ({
    ...r,
    adviserId: r.adviserId ?? null,
    adviserName: r.adviserId ? r.adviserName : null,
    logoUrl: r.logoUrl ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      acronym: organizations.acronym,
      description: organizations.description,
      logoUrl: organizations.logoUrl,
      adviserId: organizations.adviserId,
      adviserName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
      isActive: organizations.isActive,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      memberCount: sql<number>`cast(count(${orgMemberships.id}) filter (where ${orgMemberships.status} = 'active') as int)`,
    })
    .from(organizations)
    .leftJoin(users, eq(organizations.adviserId, users.id))
    .leftJoin(orgMemberships, eq(orgMemberships.organizationId, organizations.id))
    .where(eq(organizations.id, orgId))
    .groupBy(organizations.id, users.firstName, users.lastName)
    .limit(1);

  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    adviserId: r.adviserId ?? null,
    adviserName: r.adviserId ? r.adviserName : null,
    logoUrl: r.logoUrl ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getMyMemberships(userId: string): Promise<MyMembership[]> {
  const rows = await db
    .select({
      id: orgMemberships.id,
      organizationId: orgMemberships.organizationId,
      userId: orgMemberships.userId,
      status: orgMemberships.status,
      role: orgMemberships.role,
      applicationNote: orgMemberships.applicationNote,
      reviewNote: orgMemberships.reviewNote,
      reviewedAt: orgMemberships.reviewedAt,
      createdAt: orgMemberships.createdAt,
      updatedAt: orgMemberships.updatedAt,
      orgName: organizations.name,
      orgAcronym: organizations.acronym,
      orgDescription: organizations.description,
    })
    .from(orgMemberships)
    .innerJoin(organizations, eq(orgMemberships.organizationId, organizations.id))
    .where(eq(orgMemberships.userId, userId));

  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    userId: r.userId,
    status: r.status,
    role: r.role,
    applicationNote: r.applicationNote ?? null,
    reviewNote: r.reviewNote ?? null,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    organization: {
      id: r.organizationId,
      name: r.orgName,
      acronym: r.orgAcronym,
      description: r.orgDescription,
    },
  }));
}

export async function getMyApplications(userId: string): Promise<OrgApplication[]> {
  // Returns all membership rows (pending, declined, removed) for tracking purposes.
  // Active members are shown under "My Organizations" so we exclude them here.
  const rows = await db
    .select({
      id: orgMemberships.id,
      organizationId: orgMemberships.organizationId,
      userId: orgMemberships.userId,
      status: orgMemberships.status,
      applicationNote: orgMemberships.applicationNote,
      reviewNote: orgMemberships.reviewNote,
      reviewedAt: orgMemberships.reviewedAt,
      createdAt: orgMemberships.createdAt,
      orgName: organizations.name,
      orgAcronym: organizations.acronym,
    })
    .from(orgMemberships)
    .innerJoin(organizations, eq(orgMemberships.organizationId, organizations.id))
    .where(
      and(
        eq(orgMemberships.userId, userId),
        ne(orgMemberships.status, 'active'),
      )
    );

  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    organizationName: r.orgName,
    organizationAcronym: r.orgAcronym,
    status: r.status,
    applicationNote: r.applicationNote ?? null,
    reviewNote: r.reviewNote ?? null,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function findMembership(userId: string, orgId: string) {
  const rows = await db
    .select()
    .from(orgMemberships)
    .where(
      and(
        eq(orgMemberships.userId, userId),
        eq(orgMemberships.organizationId, orgId),
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function createMembership(
  userId: string,
  orgId: string,
  applicationNote?: string,
) {
  const rows = await db
    .insert(orgMemberships)
    .values({
      userId,
      organizationId: orgId,
      status: 'pending',
      role: 'member',
      applicationNote: applicationNote ?? null,
    })
    .returning();
  return rows[0];
}

export async function reviewMembership(
  membershipId: string,
  reviewerId: string,
  status: 'active' | 'declined',
  reviewNote?: string,
) {
  const rows = await db
    .update(orgMemberships)
    .set({
      status,
      reviewedBy: reviewerId,
      reviewNote: reviewNote ?? null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orgMemberships.id, membershipId))
    .returning();
  return rows[0] ?? null;
}

export async function removeMember(membershipId: string, removedBy: string) {
  const rows = await db
    .update(orgMemberships)
    .set({ status: 'removed', reviewedBy: removedBy, updatedAt: new Date() })
    .where(eq(orgMemberships.id, membershipId))
    .returning();
  return rows[0] ?? null;
}

export async function getOrgMembers(orgId: string): Promise<OrgMemberDetail[]> {
  const rows = await db
    .select({
      membershipId: orgMemberships.id,
      userId: orgMemberships.userId,
      role: orgMemberships.role,
      status: orgMemberships.status,
      joinedAt: orgMemberships.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      studentNumber: users.studentNumber,
      program: users.program,
      section: users.section,
    })
    .from(orgMemberships)
    .innerJoin(users, eq(orgMemberships.userId, users.id))
    .where(
      and(
        eq(orgMemberships.organizationId, orgId),
        eq(orgMemberships.status, 'active'),
      )
    );

  return rows.map((r) => ({
    membershipId: r.membershipId,
    userId: r.userId,
    name: `${r.firstName} ${r.lastName}`,
    email: r.email,
    studentNumber: r.studentNumber ?? null,
    program: r.program ?? null,
    section: r.section ?? null,
    role: r.role,
    status: r.status,
    joinedAt: r.joinedAt.toISOString(),
  }));
}

export async function getPendingApplications(orgId: string) {
  const rows = await db
    .select({
      membershipId: orgMemberships.id,
      userId: orgMemberships.userId,
      applicationNote: orgMemberships.applicationNote,
      createdAt: orgMemberships.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      studentNumber: users.studentNumber,
      program: users.program,
      section: users.section,
    })
    .from(orgMemberships)
    .innerJoin(users, eq(orgMemberships.userId, users.id))
    .where(
      and(
        eq(orgMemberships.organizationId, orgId),
        eq(orgMemberships.status, 'pending'),
      )
    );

  return rows.map((r) => ({
    membershipId: r.membershipId,
    userId: r.userId,
    name: `${r.firstName} ${r.lastName}`,
    email: r.email,
    studentNumber: r.studentNumber ?? null,
    program: r.program ?? null,
    section: r.section ?? null,
    applicationNote: r.applicationNote ?? null,
    appliedAt: r.createdAt.toISOString(),
  }));
}

export async function isOfficer(userId: string, orgId: string): Promise<boolean> {
  const rows = await db
    .select({ role: orgMemberships.role })
    .from(orgMemberships)
    .where(
      and(
        eq(orgMemberships.userId, userId),
        eq(orgMemberships.organizationId, orgId),
        eq(orgMemberships.status, 'active'),
      )
    )
    .limit(1);

  if (!rows[0]) return false;
  return rows[0].role === 'officer' || rows[0].role === 'president';
}

export async function getMembershipById(membershipId: string) {
  const rows = await db
    .select()
    .from(orgMemberships)
    .where(eq(orgMemberships.id, membershipId))
    .limit(1);
  return rows[0] ?? null;
}
