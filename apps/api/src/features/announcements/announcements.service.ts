import { announcementsRepository, type AnnouncementFilters } from './announcements.repository.js';
import { NotFoundError, ForbiddenError } from '../../errors/app-error.js';
import type { CreateAnnouncementInput } from '@ccs-hub/shared';

export const announcementsService = {
  async getAnnouncements(filters: AnnouncementFilters) {
    return announcementsRepository.findMany(filters);
  },

  async getAnnouncementById(id: string) {
    const announcement = await announcementsRepository.findById(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }
    return announcement;
  },

  async createAnnouncement(
    input: CreateAnnouncementInput,
    user: { id: string; role: string }
  ) {
    if (user.role === 'student') {
      throw new ForbiddenError('Students are not permitted to publish announcements');
    }

    if (input.audience === 'dean' && user.role !== 'admin') {
      throw new ForbiddenError('Only administrators can publish Dean-level announcements');
    }

    const created = await announcementsRepository.create({
      title: input.title,
      body: input.body,
      audience: input.audience,
      organizationId: input.organizationId,
      isPinned: input.isPinned ?? false,
      createdBy: user.id,
    });

    return created;
  },
};
