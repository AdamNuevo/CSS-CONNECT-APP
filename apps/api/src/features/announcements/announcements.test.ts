import { describe, it, expect, vi, beforeEach } from 'vitest';
import { announcementsService } from './announcements.service.js';
import { announcementsRepository } from './announcements.repository.js';
import { ForbiddenError, NotFoundError } from '../../errors/app-error.js';

describe('Announcements Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAnnouncements', () => {
    it('fetches announcements with pagination and filters', async () => {
      const mockResult = {
        items: [
          {
            id: '1',
            title: 'Tech Week 2026',
            body: 'Event details',
            audience: 'ccs' as const,
            organizationId: null,
            isPinned: true,
            publishedAt: new Date().toISOString(),
            expiresAt: null,
            createdBy: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            authorName: 'Admin Santos',
            organizationName: null,
          },
        ],
        total: 1,
      };

      vi.spyOn(announcementsRepository, 'findMany').mockResolvedValueOnce(mockResult);

      const result = await announcementsService.getAnnouncements({
        audience: 'ccs',
        limit: 10,
        offset: 0,
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].title).toBe('Tech Week 2026');
    });
  });

  describe('createAnnouncement', () => {
    it('rejects student user from creating announcements', async () => {
      await expect(
        announcementsService.createAnnouncement(
          {
            title: 'Student Announcement',
            body: 'This should not be allowed',
            audience: 'ccs',
            isPinned: false,
          },
          { id: 'student-id', role: 'student' }
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('rejects faculty from creating dean-level announcements', async () => {
      await expect(
        announcementsService.createAnnouncement(
          {
            title: 'Dean Level Notice',
            body: 'Only dean can post this',
            audience: 'dean',
            isPinned: false,
          },
          { id: 'faculty-id', role: 'faculty' }
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('allows admin to create announcements', async () => {
      const mockCreated = {
        id: 'new-announcement-id',
        title: 'Enrollment Open',
        body: 'Details here',
        audience: 'all' as const,
        organizationId: null,
        isPinned: true,
        publishedAt: new Date(),
        expiresAt: null,
        createdBy: 'admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(announcementsRepository, 'create').mockResolvedValueOnce(mockCreated);

      const result = await announcementsService.createAnnouncement(
        {
          title: 'Enrollment Open',
          body: 'Details here',
          audience: 'all',
          isPinned: true,
        },
        { id: 'admin-id', role: 'admin' }
      );

      expect(result.id).toBe('new-announcement-id');
      expect(result.title).toBe('Enrollment Open');
    });
  });

  describe('getAnnouncementById', () => {
    it('throws NotFoundError when announcement does not exist', async () => {
      vi.spyOn(announcementsRepository, 'findById').mockResolvedValueOnce(null);

      await expect(
        announcementsService.getAnnouncementById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
