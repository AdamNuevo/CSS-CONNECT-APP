import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users, type User } from '../../db/schema/index.js';

export interface UserListFilter {
  role?: string;
  page?: number;
  limit?: number;
}

export class UsersRepository {
  async findUsers(filter: UserListFilter = {}): Promise<{ users: User[]; total: number }> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const offset = (page - 1) * limit;

    const baseQuery = db.select().from(users);

    if (filter.role) {
      baseQuery.where(eq(users.role, filter.role as any));
    }

    const data = await baseQuery
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users);

    return { users: data, total: count };
  }

  async findUserById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }
}

export const usersRepository = new UsersRepository();
