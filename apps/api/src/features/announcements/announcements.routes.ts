import { Router } from 'express';
import { announcementsController } from './announcements.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createAnnouncementSchema } from '@ccs-hub/shared';

export const announcementsRouter = Router();

announcementsRouter.get('/', authenticate, announcementsController.list);
announcementsRouter.get('/:id', authenticate, announcementsController.getById);
announcementsRouter.post(
  '/',
  authenticate,
  requireRole('admin', 'org_officer', 'faculty'),
  validateBody(createAnnouncementSchema),
  announcementsController.create
);
