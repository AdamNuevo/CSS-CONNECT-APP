import type { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service.js';
import { UnauthorizedError } from '../../errors/app-error.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  requestTemporaryPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.requestTemporaryPassword(req.body.email);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const result = await this.service.changePassword(req.user.sub, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.refreshToken(req.body.refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.logout(req.body.refreshToken);
      res.status(200).json({ message: 'Successfully logged out' });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await this.service.getCurrentUser(req.user.sub);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
