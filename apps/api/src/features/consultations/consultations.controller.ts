import type { Request, Response, NextFunction } from 'express';
import { consultationsService } from './consultations.service.js';

export const consultationsController = {
  async listProfessors(_req: Request, res: Response, next: NextFunction) {
    try {
      const professors = await consultationsService.getProfessors();
      res.json({ data: professors });
    } catch (err) {
      next(err);
    }
  },

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter "date" (YYYY-MM-DD) is required',
          },
        });
      }

      const availability = await consultationsService.getProfessorAvailability(id, date);
      res.json({ data: availability });
    } catch (err) {
      next(err);
    }
  },

  async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const status = req.query.status as string | undefined;
      const requests = await consultationsService.getMyRequests(user, status);
      res.json({ data: requests });
    } catch (err) {
      next(err);
    }
  },

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const created = await consultationsService.createConsultationRequest(user.id, req.body);
      res.status(201).json({ data: created });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const updated = await consultationsService.updateRequestStatus(user, id, req.body);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },

  async getMySlots(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const slots = await consultationsService.getFacultySlots(user.id);
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  },

  async setMySlots(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const slots = await consultationsService.setFacultySlots(user.id, req.body.slots);
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  },
};
