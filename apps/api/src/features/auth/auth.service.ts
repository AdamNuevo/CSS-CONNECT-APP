import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { authRepository, AuthRepository } from './auth.repository.js';
import { emailService } from '../../services/email.service.js';
import {
  UnauthorizedError,
  RateLimitError,
  NotFoundError,
} from '../../errors/app-error.js';
import type {
  LoginInput,
  ChangePasswordInput,
  PublicUser,
  LoginResponse,
  AuthTokens,
} from '@ccs-hub/shared';
import type { User } from '../../db/schema/index.js';

const EMAIL_COOLDOWN_MS = 60 * 1000;
const TEMP_PASSWORD_EXPIRY_MS = 24 * 60 * 60 * 1000;

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateTemporaryPassword(): string {
    // Generates an 8-character string with uppercase, lowercase, and numbers
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const all = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    result += uppercase[crypto.randomInt(0, uppercase.length)];
    result += numbers[crypto.randomInt(0, numbers.length)];

    for (let i = 2; i < 8; i++) {
      result += all[crypto.randomInt(0, all.length)];
    }

    return result
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  private createAccessToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    // Default 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.repo.saveRefreshToken(userId, tokenHash, expiresAt);

    return rawToken;
  }

  public sanitizeUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      studentNumber: user.studentNumber,
      employeeNumber: user.employeeNumber,
      program: user.program,
      yearLevel: user.yearLevel,
      section: user.section,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
      mustChangePassword: user.mustChangePassword,
    };
  }

  async requestTemporaryPassword(
    email: string
  ): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.repo.findUserByEmail(normalizedEmail);

    if (existingUser) {
      const tempPassword = this.generateTemporaryPassword();
      const passwordHash = await argon2.hash(tempPassword);

      await this.repo.updateUserPassword(existingUser.id, passwordHash, true);

      const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRY_MS);
      await this.repo.savePasswordResetToken(
        existingUser.id,
        this.hashToken(tempPassword),
        expiresAt
      );

      await emailService.sendTemporaryPassword(
        existingUser.email,
        existingUser.firstName,
        tempPassword
      );

      return {
        message: 'If an account exists for this email, temporary sign-in instructions have been sent.',
      };
    }

    // Check CCS masterlist for first-time user
    const masterlistEntry = await this.repo.findMasterlistEntryByEmail(normalizedEmail);
    if (masterlistEntry) {
      if (
        masterlistEntry.lastEmailSentAt &&
        Date.now() - masterlistEntry.lastEmailSentAt.getTime() < EMAIL_COOLDOWN_MS
      ) {
        throw new RateLimitError(
          'A temporary password was recently requested. Please check your inbox or wait before resending.'
        );
      }

      const tempPassword = this.generateTemporaryPassword();
      const passwordHash = await argon2.hash(tempPassword);

      const createdUser = await this.repo.createUserFromMasterlist(
        masterlistEntry,
        passwordHash
      );

      const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRY_MS);
      await this.repo.savePasswordResetToken(
        createdUser.id,
        this.hashToken(tempPassword),
        expiresAt
      );

      await emailService.sendTemporaryPassword(
        masterlistEntry.email,
        masterlistEntry.firstName,
        tempPassword
      );
    }

    // Always return generic message to prevent account enumeration
    return {
      message: 'If an account exists for this email, temporary sign-in instructions have been sent.',
    };
  }

  async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await argon2.hash(input.newPassword);
    await this.repo.updateUserPassword(user.id, newHash, false);

    // Invalidate old sessions and reset tokens
    await this.repo.revokeAllUserRefreshTokens(user.id);
    await this.repo.markPasswordResetTokensUsed(user.id);

    const accessToken = this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    const updatedUser = { ...user, mustChangePassword: false };

    return {
      user: this.sanitizeUser(updatedUser),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(rawToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.repo.findRefreshToken(tokenHash);

    if (!stored) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Token reuse detection: if revoked token is presented, invalidate all tokens for user
    if (stored.revoked) {
      await this.repo.revokeAllUserRefreshTokens(stored.userId);
      throw new UnauthorizedError('Refresh token has already been used');
    }

    if (new Date() > stored.expiresAt) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Revoke used token before issuing new pair (token rotation)
    await this.repo.revokeRefreshToken(tokenHash);

    const user = await this.repo.findUserById(stored.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    const accessToken = this.createAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await this.repo.revokeRefreshToken(tokenHash);
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.repo.findUserById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
