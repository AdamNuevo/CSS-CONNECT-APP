import type { Request, Response, NextFunction } from 'express';
import { announcementsService } from './announcements.service.js';

export const announcementsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const audience = req.query.audience as 'all' | 'dean' | 'ccs' | 'org' | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = await announcementsService.getAnnouncements({
        audience,
        limit,
        offset,
      });

      res.json({
        data: result.items,
        meta: {
          total: result.total,
          limit,
          offset,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const announcement = await announcementsService.getAnnouncementById(req.params.id);
      res.json({ data: announcement });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const created = await announcementsService.createAnnouncement(req.body, user);
      res.status(201).json({ data: created });
    } catch (err) {
      next(err);
    }
  },
};
