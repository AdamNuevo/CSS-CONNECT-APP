import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index.js';
import { env } from '../config/env.js';

describe('Auth Middleware & RBAC Enforcement', () => {
  const createTestToken = (role: 'student' | 'faculty' | 'org_officer' | 'admin') => {
    return jwt.sign(
      {
        sub: '00000000-0000-0000-0000-000000000001',
        email: `test-${role}@ccs.qcu.edu.ph`,
        role,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  };

  it('rejects protected endpoints when no Bearer token is provided', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('rejects protected endpoints when token signature is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-string');

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('blocks a student from accessing an admin/faculty endpoint (403 Forbidden)', async () => {
    const studentToken = createTestToken('student');

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty('code', 'FORBIDDEN');
  });

  it('allows an admin to access the user roster endpoint', async () => {
    const adminToken = createTestToken('admin');

    const { usersRepository } = await import('../features/users/users.repository.js');
    const { vi } = await import('vitest');
    vi.spyOn(usersRepository, 'findUsers').mockResolvedValueOnce({
      users: [],
      total: 0,
    });

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });
});
