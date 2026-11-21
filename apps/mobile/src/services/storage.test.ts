import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSecureStore = new Map<string, string>();

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  getItemAsync: vi.fn(async (key: string) => {
    return mockSecureStore.get(key) ?? null;
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import { storage } from './storage';
import type { PublicUser } from '@ccs-hub/shared';

describe('Mobile Storage Service', () => {
  beforeEach(async () => {
    mockSecureStore.clear();
    await storage.clearTokens();
    await storage.clearUserProfile();
    await storage.setSavedEmail(null);
  });

  it('saves and retrieves access and refresh tokens', async () => {
    await storage.saveTokens('access-token-123', 'refresh-token-456');

    const tokens = await storage.getTokens();
    expect(tokens.accessToken).toBe('access-token-123');
    expect(tokens.refreshToken).toBe('refresh-token-456');
  });

  it('clears tokens properly', async () => {
    await storage.saveTokens('token-to-clear-1', 'token-to-clear-2');
    await storage.clearTokens();

    const tokens = await storage.getTokens();
    expect(tokens.accessToken).toBeNull();
    expect(tokens.refreshToken).toBeNull();
  });

  it('saves and restores user profile', async () => {
    const dummyUser: PublicUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'student@students.qcu.edu.ph',
      role: 'student',
      firstName: 'Kristine',
      lastName: 'Villanueva',
      middleName: 'M.',
      studentNumber: '2022-00001',
      employeeNumber: null,
      program: 'BSIT',
      yearLevel: '3rd Year',
      section: 'IT-301',
      avatarUrl: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await storage.saveUserProfile(dummyUser);
    const restored = await storage.getUserProfile();

    expect(restored).not.toBeNull();
    expect(restored?.email).toBe('student@students.qcu.edu.ph');
    expect(restored?.studentNumber).toBe('2022-00001');
  });

  it('manages saved email preference for keep me signed in', async () => {
    await storage.setSavedEmail('saved.email@students.qcu.edu.ph');
    let email = await storage.getSavedEmail();
    expect(email).toBe('saved.email@students.qcu.edu.ph');

    await storage.setSavedEmail(null);
    email = await storage.getSavedEmail();
    expect(email).toBeNull();
  });
});
