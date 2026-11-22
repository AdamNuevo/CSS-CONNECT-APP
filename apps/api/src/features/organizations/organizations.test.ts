import { describe, it, expect, vi, beforeEach } from 'vitest';
import { organizationsService } from './organizations.service.js';
import * as orgRepo from './organizations.repository.js';
import * as orgAnnounceRepo from './org-announcements.repository.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app-error.js';

describe('Organizations Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockOrg = {
    id: 'org-1',
    name: 'Association for Computing Machinery QCU',
    acronym: 'ACM-QCU',
    description: 'Premier computing organization at QCU.',
    logoUrl: null,
    adviserId: 'faculty-1',
    adviserName: 'Prof. Maria Santos',
    isActive: true,
    memberCount: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const studentUser = {
    id: 'student-1',
    role: 'student',
    email: 'kristine.villanueva@student.qcu.edu.ph',
  };

  const officerUser = {
    id: 'officer-1',
    role: 'student',
    email: 'jessa.aquino@student.qcu.edu.ph',
  };

  const adminUser = {
    id: 'admin-1',
    role: 'admin',
    email: 'admin@ccs.qcu.edu.ph',
  };

  describe('list & getById', () => {
    it('returns all active organizations', async () => {
      vi.spyOn(orgRepo, 'listOrganizations').mockResolvedValueOnce([mockOrg]);

      const result = await organizationsService.list();
      expect(result).toHaveLength(1);
      expect(result[0].acronym).toBe('ACM-QCU');
      expect(result[0].memberCount).toBe(25);
    });

    it('returns an organization by id', async () => {
      vi.spyOn(orgRepo, 'getOrganizationById').mockResolvedValueOnce(mockOrg);

      const result = await organizationsService.getById('org-1');
      expect(result.name).toBe('Association for Computing Machinery QCU');
    });

    it('throws NotFoundError when organization is missing', async () => {
      vi.spyOn(orgRepo, 'getOrganizationById').mockResolvedValueOnce(null);

      await expect(organizationsService.getById('non-existent')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('apply', () => {
    it('creates a pending membership application successfully', async () => {
      vi.spyOn(orgRepo, 'getOrganizationById').mockResolvedValueOnce(mockOrg);
      vi.spyOn(orgRepo, 'findMembership').mockResolvedValueOnce(null as any);
      vi.spyOn(orgRepo, 'createMembership').mockResolvedValueOnce({
        id: 'mem-new',
        organizationId: 'org-1',
        userId: studentUser.id,
        status: 'pending',
        role: 'member',
        applicationNote: 'I want to join ACM!',
        reviewNote: null,
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await organizationsService.apply(
        studentUser.id,
        'org-1',
        'I want to join ACM!'
      );
      expect(result.status).toBe('pending');
      expect(result.applicationNote).toBe('I want to join ACM!');
    });

    it('throws ConflictError if user is already an active member', async () => {
      vi.spyOn(orgRepo, 'getOrganizationById').mockResolvedValueOnce(mockOrg);
      vi.spyOn(orgRepo, 'findMembership').mockResolvedValueOnce({
        id: 'mem-active',
        organizationId: 'org-1',
        userId: studentUser.id,
        status: 'active',
        role: 'member',
      } as any);

      await expect(
        organizationsService.apply(studentUser.id, 'org-1')
      ).rejects.toThrow(ConflictError);
    });

    it('throws ConflictError if user already has a pending application', async () => {
      vi.spyOn(orgRepo, 'getOrganizationById').mockResolvedValueOnce(mockOrg);
      vi.spyOn(orgRepo, 'findMembership').mockResolvedValueOnce({
        id: 'mem-pending',
        organizationId: 'org-1',
        userId: studentUser.id,
        status: 'pending',
        role: 'member',
      } as any);

      await expect(
        organizationsService.apply(studentUser.id, 'org-1')
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('reviewApplication', () => {
    it('allows an officer to approve a pending application', async () => {
      vi.spyOn(orgRepo, 'isOfficer').mockResolvedValueOnce(true);
      vi.spyOn(orgRepo, 'getMembershipById').mockResolvedValueOnce({
        id: 'mem-pending',
        organizationId: 'org-1',
        userId: studentUser.id,
        status: 'pending',
        role: 'member',
      } as any);
      vi.spyOn(orgRepo, 'reviewMembership').mockResolvedValueOnce({
        id: 'mem-pending',
        status: 'active',
        reviewNote: 'Welcome aboard!',
      } as any);

      const result = await organizationsService.reviewApplication(
        officerUser,
        'org-1',
        'mem-pending',
        'active',
        'Welcome aboard!'
      );

      expect(result?.status).toBe('active');
    });

    it('throws ForbiddenError when a non-officer student tries to review application', async () => {
      vi.spyOn(orgRepo, 'isOfficer').mockResolvedValueOnce(false);

      await expect(
        organizationsService.reviewApplication(
          studentUser,
          'org-1',
          'mem-pending',
          'active'
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('allows an admin to review application without being an officer', async () => {
      vi.spyOn(orgRepo, 'getMembershipById').mockResolvedValueOnce({
        id: 'mem-pending',
        organizationId: 'org-1',
        userId: studentUser.id,
        status: 'pending',
        role: 'member',
      } as any);
      vi.spyOn(orgRepo, 'reviewMembership').mockResolvedValueOnce({
        id: 'mem-pending',
        status: 'declined',
        reviewNote: 'Prerequisites not met',
      } as any);

      const result = await organizationsService.reviewApplication(
        adminUser,
        'org-1',
        'mem-pending',
        'declined',
        'Prerequisites not met'
      );

      expect(result?.status).toBe('declined');
    });
  });

  describe('removeMember', () => {
    it('allows an officer to remove an active member', async () => {
      vi.spyOn(orgRepo, 'isOfficer').mockResolvedValueOnce(true);
      vi.spyOn(orgRepo, 'getMembershipById').mockResolvedValueOnce({
        id: 'mem-active',
        organizationId: 'org-1',
        status: 'active',
      } as any);
      vi.spyOn(orgRepo, 'removeMember').mockResolvedValueOnce({
        id: 'mem-active',
        status: 'removed',
      } as any);

      const result = await organizationsService.removeMember(
        officerUser,
        'org-1',
        'mem-active'
      );
      expect(result?.status).toBe('removed');
    });

    it('throws BadRequestError when trying to remove non-active member', async () => {
      vi.spyOn(orgRepo, 'isOfficer').mockResolvedValueOnce(true);
      vi.spyOn(orgRepo, 'getMembershipById').mockResolvedValueOnce({
        id: 'mem-declined',
        organizationId: 'org-1',
        status: 'declined',
      } as any);

      await expect(
        organizationsService.removeMember(officerUser, 'org-1', 'mem-declined')
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('announcements', () => {
    it('allows an officer to post an announcement', async () => {
      vi.spyOn(orgRepo, 'isOfficer').mockResolvedValueOnce(true);
      vi.spyOn(orgAnnounceRepo, 'createOrgAnnouncement').mockResolvedValueOnce({
        id: 'ann-1',
        title: 'General Assembly',
        body: 'Join us this Friday at 3 PM in Room 201.',
        audience: 'org',
        organizationId: 'org-1',
      } as any);

      const result = await organizationsService.createAnnouncement(
        officerUser,
        'org-1',
        {
          title: 'General Assembly',
          body: 'Join us this Friday at 3 PM in Room 201.',
          isPinned: true,
        }
      );

      expect(result.title).toBe('General Assembly');
    });

    it('throws ForbiddenError when non-officer attempts to post announcement', async () => {
      vi.spyOn(orgRepo, 'isOfficer').mockResolvedValueOnce(false);

      await expect(
        organizationsService.createAnnouncement(studentUser, 'org-1', {
          title: 'Unauthorized Announcement',
          body: 'Should not pass',
          isPinned: false,
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
