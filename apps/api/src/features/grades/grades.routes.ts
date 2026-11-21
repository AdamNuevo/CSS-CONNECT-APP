import { Router } from 'express';
import { gradesController } from './grades.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

export const gradesRouter = Router();

gradesRouter.get(
  '/my',
  authenticate,
  requireRole('student'),
  gradesController.getMyGrades
);
