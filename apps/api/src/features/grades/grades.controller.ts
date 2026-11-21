import type { Request, Response, NextFunction } from 'express';
import { gradesService } from './grades.service.js';

export const gradesController = {
  async getMyGrades(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const academicYear = req.query.academicYear as string | undefined;
      const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : undefined;

      const summary = await gradesService.getStudentGrades(
        user.id,
        academicYear,
        semester
      );

      res.json({ data: summary });
    } catch (err) {
      next(err);
    }
  },
};
