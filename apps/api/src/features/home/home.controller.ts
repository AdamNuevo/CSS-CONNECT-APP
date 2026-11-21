import type { Request, Response, NextFunction } from 'express';
import { homeService } from './home.service.js';

export const homeController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = await homeService.getDashboard(user);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
