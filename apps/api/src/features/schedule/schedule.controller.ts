import type { Request, Response, NextFunction } from 'express';
import { scheduleService } from './schedule.service.js';

export const scheduleController = {
  async getWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const academicYear = req.query.academicYear as string | undefined;
      const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : undefined;

      const schedule = await scheduleService.getWeeklySchedule(
        user.id,
        user.role,
        academicYear,
        semester
      );

      res.json({ data: schedule });
    } catch (err) {
      next(err);
    }
  },

  async getNextClass(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const nextClass = await scheduleService.getNextClass(user.id, user.role);
      res.json({ data: nextClass });
    } catch (err) {
      next(err);
    }
  },
};
