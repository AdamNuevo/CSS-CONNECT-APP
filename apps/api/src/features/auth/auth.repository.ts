import { eq, and, gt } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  users,
  type User,
  refreshTokens,
  type RefreshToken,
  passwordResetTokens,
  ccsMasterlist,
  type MasterlistEntry,
} from '../../db/schema/index.js';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    return rows[0] ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string,
    mustChangePassword: boolean
  ): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        mustChangePassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async findMasterlistEntryByEmail(email: string): Promise<MasterlistEntry | null> {
    const rows = await db
      .select()
      .from(ccsMasterlist)
      .where(eq(ccsMasterlist.email, email.toLowerCase().trim()))
      .limit(1);

    return rows[0] ?? null;
  }

  async createUserFromMasterlist(
    entry: MasterlistEntry,
    passwordHash: string
  ): Promise<User> {
    const [created] = await db
      .insert(users)
      .values({
        email: entry.email,
        passwordHash,
        role: entry.role,
        firstName: entry.firstName,
        lastName: entry.lastName,
        middleName: entry.middleName,
        studentNumber: entry.studentNumber,
        employeeNumber: entry.employeeNumber,
        program: entry.program,
        yearLevel: entry.yearLevel,
        section: entry.section,
        mustChangePassword: true,
      })
      .returning();

    await db
      .update(ccsMasterlist)
      .set({
        isClaimed: true,
        lastEmailSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ccsMasterlist.id, entry.id));

    return created;
  }

  async updateMasterlistEmailSentAt(id: string): Promise<void> {
    await db
      .update(ccsMasterlist)
      .set({
        lastEmailSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ccsMasterlist.id, id));
  }

  async saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    const [saved] = await db
      .insert(refreshTokens)
      .values({
        userId,
        tokenHash,
        expiresAt,
        revoked: false,
      })
      .returning();

    return saved;
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const rows = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return rows[0] ?? null;
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  async savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await db.insert(passwordResetTokens).values({
      userId,
      tokenHash,
      expiresAt,
      used: false,
    });
  }

  async findActivePasswordResetToken(
    userId: string,
    tokenHash: string
  ): Promise<boolean> {
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    return rows.length > 0;
  }

  async markPasswordResetTokensUsed(userId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.userId, userId));
  }
}

export const authRepository = new AuthRepository();
