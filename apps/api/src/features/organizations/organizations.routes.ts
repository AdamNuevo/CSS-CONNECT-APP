import { Router } from 'express';
import { organizationsController } from './organizations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import {
  applyToOrgSchema,
  reviewApplicationSchema,
  postOrgAnnouncementSchema,
} from '@ccs-hub/shared';

export const organizationsRouter = Router();

// Student-accessible routes
organizationsRouter.get('/', authenticate, organizationsController.list);
organizationsRouter.get('/my', authenticate, organizationsController.getMyMemberships);
organizationsRouter.get('/my-applications', authenticate, organizationsController.getMyApplications);
organizationsRouter.get('/:id', authenticate, organizationsController.getById);
organizationsRouter.post(
  '/:id/apply',
  authenticate,
  validateBody(applyToOrgSchema),
  organizationsController.apply
);
organizationsRouter.get('/:id/announcements', authenticate, organizationsController.getAnnouncements);

// Officer / Admin routes (RBAC enforced in service layer + authenticate middleware)
organizationsRouter.get(
  '/:id/members',
  authenticate,
  organizationsController.getMembers
);
organizationsRouter.get(
  '/:id/applications',
  authenticate,
  organizationsController.getApplications
);
organizationsRouter.patch(
  '/:id/applications/:membershipId',
  authenticate,
  validateBody(reviewApplicationSchema),
  organizationsController.reviewApplication
);
organizationsRouter.delete(
  '/:id/members/:membershipId',
  authenticate,
  organizationsController.removeMember
);
organizationsRouter.post(
  '/:id/announcements',
  authenticate,
  validateBody(postOrgAnnouncementSchema),
  organizationsController.createAnnouncement
);
organizationsRouter.delete(
  '/:id/announcements/:announcementId',
  authenticate,
  organizationsController.deleteAnnouncement
);
