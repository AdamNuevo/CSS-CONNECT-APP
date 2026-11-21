import type { Request, Response, NextFunction } from 'express';
import { organizationsService } from './organizations.service.js';

export const organizationsController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await organizationsService.list();
      res.json({ data: orgs });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await organizationsService.getById(req.params.id);
      res.json({ data: org });
    } catch (err) {
      next(err);
    }
  },

  async getMyMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const memberships = await organizationsService.getMyMemberships(req.user!.id);
      res.json({ data: memberships });
    } catch (err) {
      next(err);
    }
  },

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await organizationsService.getMyApplications(req.user!.id);
      res.json({ data: applications });
    } catch (err) {
      next(err);
    }
  },

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationNote } = req.body;
      const result = await organizationsService.apply(
        req.user!.id,
        req.params.id,
        applicationNote
      );
      res.status(201).json({
        data: result,
        message: 'Application submitted successfully. An officer will review your request.',
      });
    } catch (err) {
      next(err);
    }
  },

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await organizationsService.getMembers(req.user!, req.params.id);
      res.json({ data: members });
    } catch (err) {
      next(err);
    }
  },

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await organizationsService.getPendingApplications(
        req.user!,
        req.params.id
      );
      res.json({ data: applications });
    } catch (err) {
      next(err);
    }
  },

  async reviewApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reviewNote } = req.body;
      const result = await organizationsService.reviewApplication(
        req.user!,
        req.params.id,
        req.params.membershipId,
        status,
        reviewNote
      );
      res.json({
        data: result,
        message: `Application has been ${status}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationsService.removeMember(
        req.user!,
        req.params.id,
        req.params.membershipId
      );
      res.json({
        data: result,
        message: 'Member removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await organizationsService.getAnnouncements(req.params.id);
      res.json({ data: announcements });
    } catch (err) {
      next(err);
    }
  },

  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationsService.createAnnouncement(
        req.user!,
        req.params.id,
        req.body
      );
      res.status(201).json({
        data: result,
        message: 'Announcement posted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      await organizationsService.deleteAnnouncement(
        req.user!,
        req.params.id,
        req.params.announcementId
      );
      res.json({ message: 'Announcement deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};
