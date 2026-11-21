import type { Request, Response, NextFunction } from 'express';
import { evaluationsService } from './evaluations.service.js';

export const evaluationsController = {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const status = await evaluationsService.getStudentEvaluationStatus(user.id);
      res.json({ data: status });
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const submission = await evaluationsService.submitEvaluation(user.id, req.body);
      res.status(201).json({ data: submission });
    } catch (err) {
      next(err);
    }
  },
};
