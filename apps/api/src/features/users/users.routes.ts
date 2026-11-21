import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const usersRouter: Router = Router();

// Middleware-level protection: require valid JWT for all user endpoints
usersRouter.use(authenticate);

usersRouter.get('/', requireRole('admin', 'faculty'), usersController.listUsers);
usersRouter.get('/:id', usersController.getUserById);

export { usersRouter };
