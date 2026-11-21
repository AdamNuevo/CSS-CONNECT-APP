import { usersRepository, UsersRepository, type UserListFilter } from './users.repository.js';
import { authService } from '../auth/auth.service.js';
import { ForbiddenError, NotFoundError } from '../../errors/app-error.js';
import type { PublicUser, UserRole } from '@ccs-hub/shared';

export class UsersService {
  constructor(private repo: UsersRepository = usersRepository) {}

  async listUsers(
    requestingRole: UserRole,
    filter: UserListFilter
  ): Promise<{ data: PublicUser[]; meta: { total: number; page: number; limit: number } }> {
    // Service-level RBAC check: only admins and faculty can browse the master user roster
    if (requestingRole !== 'admin' && requestingRole !== 'faculty') {
      throw new ForbiddenError('Only faculty and administrators can view the user roster');
    }

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));

    const { users, total } = await this.repo.findUsers({ ...filter, page, limit });

    return {
      data: users.map((u) => authService.sanitizeUser(u)),
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getUserById(
    requestingUserId: string,
    requestingRole: UserRole,
    targetUserId: string
  ): Promise<PublicUser> {
    // Normal users may inspect their own profile; faculty/admin may inspect any
    if (requestingUserId !== targetUserId && requestingRole !== 'admin' && requestingRole !== 'faculty') {
      throw new ForbiddenError('You can only view your own detailed profile');
    }

    const user = await this.repo.findUserById(targetUserId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    return authService.sanitizeUser(user);
  }
}

export const usersService = new UsersService();
