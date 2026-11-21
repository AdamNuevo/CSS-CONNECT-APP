import { Router } from 'express';
import { eventsController } from './events.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createEventSchema, scanAttendanceSchema } from '@ccs-hub/shared';

export const eventsRouter = Router();

eventsRouter.get('/', authenticate, eventsController.list);
eventsRouter.get('/my/registrations', authenticate, eventsController.getMyRegistrations);
eventsRouter.post(
  '/attendance/validate',
  authenticate,
  requireRole('admin', 'org_officer'),
  validateBody(scanAttendanceSchema),
  eventsController.validateAttendance
);
eventsRouter.get('/:id', authenticate, eventsController.getById);
eventsRouter.post('/:id/register', authenticate, eventsController.register);
eventsRouter.get(
  '/:id/report',
  authenticate,
  requireRole('admin', 'org_officer'),
  eventsController.getReport
);
eventsRouter.post(
  '/',
  authenticate,
  requireRole('admin', 'org_officer'),
  validateBody(createEventSchema),
  eventsController.create
);
