import type { Request, Response, NextFunction } from 'express';
import { usersService, UsersService } from './users.service.js';
import { UnauthorizedError } from '../../errors/app-error.js';

export class UsersController {
  constructor(private service: UsersService = usersService) {}

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const role = req.query.role as string | undefined;

      const result = await this.service.listUsers(req.user.role, { page, limit, role });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await this.service.getUserById(
        req.user.sub,
        req.user.role,
        req.params.id
      );
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };
}

export const usersController = new UsersController();
