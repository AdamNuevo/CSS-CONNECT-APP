export type MembershipStatus = 'pending' | 'active' | 'declined' | 'removed';
export type MembershipRole = 'member' | 'officer' | 'president';

export interface Organization {
  id: string;
  name: string;
  acronym: string;
  description: string;
  category?: string | null;
  logoUrl?: string | null;
  adviserId?: string | null;
  adviserName?: string | null;
  presidentName?: string | null;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMembership {
  id: string;
  organizationId: string;
  userId: string;
  status: MembershipStatus;
  role: MembershipRole;
  applicationNote?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyMembership extends OrgMembership {
  organization: Pick<Organization, 'id' | 'name' | 'acronym' | 'description'>;
}

export interface OrgApplication {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationAcronym: string;
  status: MembershipStatus;
  applicationNote?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface OrgMemberDetail {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  studentNumber?: string | null;
  program?: string | null;
  section?: string | null;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
}
