import { Router } from 'express';
import { evaluationsController } from './evaluations.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { submitEvaluationSchema } from '@ccs-hub/shared';

export const evaluationsRouter = Router();

evaluationsRouter.get(
  '/status',
  authenticate,
  requireRole('student'),
  evaluationsController.getStatus
);

evaluationsRouter.post(
  '/submit',
  authenticate,
  requireRole('student'),
  validateBody(submitEvaluationSchema),
  evaluationsController.submit
);
