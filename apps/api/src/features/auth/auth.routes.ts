import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { env } from '../../config/env.js';
import {
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '@ccs-hub/shared';

const authRouter: Router = Router();

// Rate limiting for sensitive authentication endpoints
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_AUTH,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
});

authRouter.use(authLimiter);

authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  authController.requestTemporaryPassword
);
authRouter.post(
  '/first-time',
  validateBody(forgotPasswordSchema),
  authController.requestTemporaryPassword
);
authRouter.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword
);
authRouter.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);
authRouter.post(
  '/logout',
  validateBody(refreshTokenSchema),
  authController.logout
);
authRouter.get('/me', authenticate, authController.me);

export { authRouter };
