import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { authRepository } from './auth.repository.js';
import argon2 from 'argon2';

describe('Auth Feature API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 400 when body does not match validation schema', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('returns 401 when user does not exist', async () => {
      vi.spyOn(authRepository, 'findUserByEmail').mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@ccs.qcu.edu.ph', password: 'Password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(res.body.error).toHaveProperty('message', 'Invalid email or password');
    });

    it('returns 401 when password does not match', async () => {
      vi.spyOn(authRepository, 'findUserByEmail').mockResolvedValueOnce({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'student@students.qcu.edu.ph',
        passwordHash: 'some-hash',
        role: 'student',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        middleName: null,
        studentNumber: '2022-00001',
        employeeNumber: null,
        program: 'BSIT',
        yearLevel: '3rd Year',
        section: 'IT-301',
        avatarUrl: null,
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@students.qcu.edu.ph', password: 'WrongPassword1!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('returns tokens and sanitized user profile on successful login', async () => {
      vi.spyOn(authRepository, 'findUserByEmail').mockResolvedValueOnce({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'student@students.qcu.edu.ph',
        passwordHash: 'dummy-hash',
        role: 'student',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        middleName: null,
        studentNumber: '2022-00001',
        employeeNumber: null,
        program: 'BSIT',
        yearLevel: '3rd Year',
        section: 'IT-301',
        avatarUrl: null,
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(argon2, 'verify').mockResolvedValueOnce(true);

      vi.spyOn(authRepository, 'saveRefreshToken').mockResolvedValueOnce({
        id: 'token-uuid',
        userId: '11111111-1111-1111-1111-111111111111',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 100000),
        revoked: false,
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@students.qcu.edu.ph', password: 'TempPass1!' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('student@students.qcu.edu.ph');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('rotates refresh token and returns new token pair', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';

      vi.spyOn(authRepository, 'findRefreshToken').mockResolvedValueOnce({
        id: 'ref-id',
        userId,
        tokenHash: 'somehash',
        expiresAt: new Date(Date.now() + 1000000),
        revoked: false,
        createdAt: new Date(),
      });

      vi.spyOn(authRepository, 'revokeRefreshToken').mockResolvedValueOnce();

      vi.spyOn(authRepository, 'findUserById').mockResolvedValueOnce({
        id: userId,
        email: 'student@students.qcu.edu.ph',
        passwordHash: 'dummy-hash',
        role: 'student',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        middleName: null,
        studentNumber: '2022-00001',
        employeeNumber: null,
        program: 'BSIT',
        yearLevel: '3rd Year',
        section: 'IT-301',
        avatarUrl: null,
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(authRepository, 'saveRefreshToken').mockResolvedValueOnce({
        id: 'new-token-uuid',
        userId,
        tokenHash: 'newhash',
        expiresAt: new Date(Date.now() + 1000000),
        revoked: false,
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'valid-raw-refresh-token' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('detects token reuse and revokes all user sessions', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';

      vi.spyOn(authRepository, 'findRefreshToken').mockResolvedValueOnce({
        id: 'ref-id',
        userId,
        tokenHash: 'reused-hash',
        expiresAt: new Date(Date.now() + 1000000),
        revoked: true,
        createdAt: new Date(),
      });

      const revokeSpy = vi
        .spyOn(authRepository, 'revokeAllUserRefreshTokens')
        .mockResolvedValueOnce();

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'previously-revoked-token' });

      expect(res.status).toBe(401);
      expect(revokeSpy).toHaveBeenCalledWith(userId);
    });
  });

  describe('POST /api/v1/auth/first-time & forgot-password', () => {
    it('returns generic message without leaking account existence', async () => {
      vi.spyOn(authRepository, 'findUserByEmail').mockResolvedValueOnce(null);
      vi.spyOn(authRepository, 'findMasterlistEntryByEmail').mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/first-time')
        .send({ email: 'unknown@students.qcu.edu.ph' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'message',
        'If an account exists for this email, temporary sign-in instructions have been sent.'
      );
    });
  });
});
