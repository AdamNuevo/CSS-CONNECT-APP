import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { PublicUser } from '@ccs-hub/shared';

const ACCESS_TOKEN_KEY = 'ccs_hub_access_token';
const REFRESH_TOKEN_KEY = 'ccs_hub_refresh_token';
const USER_KEY = 'ccs_hub_user_profile';
const SAVED_EMAIL_KEY = 'ccs_hub_saved_email';

// In-memory fallback for web environment where SecureStore is not natively backed
const memoryFallback = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryFallback.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryFallback.get(key) ?? null;
  }
  return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryFallback.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = {
  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const accessToken = await getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  },

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  async clearTokens(): Promise<void> {
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
  },

  async getUserProfile(): Promise<PublicUser | null> {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  },

  async saveUserProfile(user: PublicUser): Promise<void> {
    await setItem(USER_KEY, JSON.stringify(user));
  },

  async clearUserProfile(): Promise<void> {
    await deleteItem(USER_KEY);
  },

  async getSavedEmail(): Promise<string | null> {
    return await getItem(SAVED_EMAIL_KEY);
  },

  async setSavedEmail(email: string | null): Promise<void> {
    if (!email) {
      await deleteItem(SAVED_EMAIL_KEY);
    } else {
      await setItem(SAVED_EMAIL_KEY, email);
    }
  },
};
