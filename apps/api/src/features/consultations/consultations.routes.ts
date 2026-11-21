import { Router } from 'express';
import { consultationsController } from './consultations.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import {
  createConsultationRequestSchema,
  updateConsultationStatusSchema,
  setFacultySlotsSchema,
} from '@ccs-hub/shared';

export const consultationsRouter = Router();

consultationsRouter.get(
  '/professors',
  authenticate,
  consultationsController.listProfessors
);

consultationsRouter.get(
  '/professors/:id/availability',
  authenticate,
  consultationsController.getAvailability
);

consultationsRouter.get(
  '/my-requests',
  authenticate,
  consultationsController.getMyRequests
);

consultationsRouter.post(
  '/requests',
  authenticate,
  requireRole('student'),
  validateBody(createConsultationRequestSchema),
  consultationsController.createRequest
);

consultationsRouter.patch(
  '/requests/:id/status',
  authenticate,
  validateBody(updateConsultationStatusSchema),
  consultationsController.updateStatus
);

consultationsRouter.get(
  '/faculty/my-slots',
  authenticate,
  requireRole('faculty'),
  consultationsController.getMySlots
);

consultationsRouter.put(
  '/faculty/my-slots',
  authenticate,
  requireRole('faculty'),
  validateBody(setFacultySlotsSchema),
  consultationsController.setMySlots
);
