import * as orgRepo from './organizations.repository.js';
import * as orgAnnounceRepo from './org-announcements.repository.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../../errors/app-error.js';
import type {
  Organization,
  MyMembership,
  OrgApplication,
  OrgMemberDetail,
  PostOrgAnnouncementInput,
} from '@ccs-hub/shared';

interface CurrentUser {
  id: string;
  role: string;
  email: string;
}

export const organizationsService = {
  async list(): Promise<Organization[]> {
    return orgRepo.listOrganizations();
  },

  async getById(id: string): Promise<Organization> {
    const org = await orgRepo.getOrganizationById(id);
    if (!org) {
      throw new NotFoundError('Organization not found.');
    }
    return org;
  },

  async getMyMemberships(userId: string): Promise<MyMembership[]> {
    return orgRepo.getMyMemberships(userId);
  },

  async getMyApplications(userId: string): Promise<OrgApplication[]> {
    return orgRepo.getMyApplications(userId);
  },

  async apply(
    userId: string,
    orgId: string,
    applicationNote?: string
  ): Promise<any> {
    const org = await orgRepo.getOrganizationById(orgId);
    if (!org || !org.isActive) {
      throw new NotFoundError('Organization not found or inactive.');
    }

    const existing = await orgRepo.findMembership(userId, orgId);
    if (existing) {
      if (existing.status === 'active') {
        throw new ConflictError('You are already an active member of this organization.');
      }
      if (existing.status === 'pending') {
        throw new ConflictError('You already have a pending application for this organization.');
      }
      // If previously declined or removed, allow applying again
    }

    return orgRepo.createMembership(userId, orgId, applicationNote);
  },

  async getMembers(user: CurrentUser, orgId: string): Promise<OrgMemberDetail[]> {
    await this.assertOfficerOrAdmin(user, orgId);
    return orgRepo.getOrgMembers(orgId);
  },

  async getPendingApplications(user: CurrentUser, orgId: string) {
    await this.assertOfficerOrAdmin(user, orgId);
    return orgRepo.getPendingApplications(orgId);
  },

  async reviewApplication(
    user: CurrentUser,
    orgId: string,
    membershipId: string,
    status: 'active' | 'declined',
    reviewNote?: string
  ) {
    await this.assertOfficerOrAdmin(user, orgId);

    const membership = await orgRepo.getMembershipById(membershipId);
    if (!membership || membership.organizationId !== orgId) {
      throw new NotFoundError('Membership application not found.');
    }

    if (membership.status !== 'pending') {
      throw new BadRequestError('Only pending applications can be reviewed.');
    }

    return orgRepo.reviewMembership(membershipId, user.id, status, reviewNote);
  },

  async removeMember(user: CurrentUser, orgId: string, membershipId: string) {
    await this.assertOfficerOrAdmin(user, orgId);

    const membership = await orgRepo.getMembershipById(membershipId);
    if (!membership || membership.organizationId !== orgId) {
      throw new NotFoundError('Member record not found.');
    }

    if (membership.status !== 'active') {
      throw new BadRequestError('Only active members can be removed.');
    }

    return orgRepo.removeMember(membershipId, user.id);
  },

  async getAnnouncements(orgId: string) {
    const org = await orgRepo.getOrganizationById(orgId);
    if (!org) {
      throw new NotFoundError('Organization not found.');
    }
    return orgAnnounceRepo.getOrgAnnouncements(orgId);
  },

  async createAnnouncement(
    user: CurrentUser,
    orgId: string,
    input: PostOrgAnnouncementInput
  ) {
    await this.assertOfficerOrAdmin(user, orgId);

    return orgAnnounceRepo.createOrgAnnouncement({
      title: input.title,
      body: input.body,
      isPinned: input.isPinned ?? false,
      expiresAt: input.expiresAt,
      organizationId: orgId,
      createdBy: user.id,
    });
  },

  async deleteAnnouncement(
    user: CurrentUser,
    orgId: string,
    announcementId: string
  ) {
    await this.assertOfficerOrAdmin(user, orgId);

    const deleted = await orgAnnounceRepo.deleteOrgAnnouncement(announcementId, orgId);
    if (!deleted) {
      throw new NotFoundError('Announcement not found in this organization.');
    }
    return deleted;
  },

  async assertOfficerOrAdmin(user: CurrentUser, orgId: string): Promise<void> {
    if (user.role === 'admin') return;

    const isAuthorized = await orgRepo.isOfficer(user.id, orgId);
    if (!isAuthorized) {
      throw new ForbiddenError(
        'Access denied. Only organization officers or administrators can perform this action.'
      );
    }
  },
};
