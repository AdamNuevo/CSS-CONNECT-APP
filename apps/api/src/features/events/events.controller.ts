import type { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service.js';

export const eventsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const userId = req.user?.id;

      const events = await eventsService.getEvents({ category, search, userId });
      res.json({ data: events });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const event = await eventsService.getEventById(id, userId);
      res.json({ data: event });
    } catch (err) {
      next(err);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const registration = await eventsService.registerForEvent(user.id, id);
      res.status(201).json({ data: registration });
    } catch (err) {
      next(err);
    }
  },

  async validateAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { qrPayload } = req.body;
      const result = await eventsService.validateAttendance(user, qrPayload);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const report = await eventsService.getEventReport(id, user);
      res.json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async getMyRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const registrations = await eventsService.getMyRegistrations(user.id);
      res.json({ data: registrations });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const created = await eventsService.createEvent(req.body, user);
      res.status(201).json({ data: created });
    } catch (err) {
      next(err);
    }
  },
};
