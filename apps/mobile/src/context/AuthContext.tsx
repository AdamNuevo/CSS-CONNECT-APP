import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import type {
  PublicUser,
  LoginInput,
  ChangePasswordInput,
  LoginResponse,
} from '@ccs-hub/shared';

interface AuthContextType {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  savedEmail: string | null;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
  requestTemporaryPassword: (email: string) => Promise<{ message: string }>;
  setNewPassword: (input: ChangePasswordInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const [cachedUser, emailPref, { accessToken }] = await Promise.all([
          storage.getUserProfile(),
          storage.getSavedEmail(),
          storage.getTokens(),
        ]);

        setSavedEmail(emailPref);

        if (accessToken && cachedUser) {
          setUser(cachedUser);

          // Silent profile validation
          try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            await storage.saveUserProfile(res.data.user);
          } catch {
            // If offline, continue using cached session
          }
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const signIn = async (input: LoginInput): Promise<void> => {
    const res = await api.post<LoginResponse>('/auth/login', input);
    const { user: profile, tokens, mustChangePassword: needsPasswordChange } = res.data;

    await storage.saveTokens(tokens.accessToken, tokens.refreshToken);
    await storage.saveUserProfile(profile);

    if (input.keepSignedIn) {
      await storage.setSavedEmail(input.email);
      setSavedEmail(input.email);
    } else {
      await storage.setSavedEmail(null);
      setSavedEmail(null);
    }

    setUser(profile);
    setMustChangePassword(needsPasswordChange);
  };

  const signOut = async (): Promise<void> => {
    try {
      const { refreshToken } = await storage.getTokens();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Best-effort server notification
    } finally {
      await storage.clearTokens();
      await storage.clearUserProfile();
      setUser(null);
      setMustChangePassword(false);
    }
  };

  const requestTemporaryPassword = async (email: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return res.data;
  };

  const setNewPassword = async (input: ChangePasswordInput): Promise<void> => {
    const res = await api.post<{ user: PublicUser; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/change-password',
      input
    );

    const { user: profile, tokens } = res.data;
    await storage.saveTokens(tokens.accessToken, tokens.refreshToken);
    await storage.saveUserProfile(profile);

    setUser(profile);
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        mustChangePassword,
        savedEmail,
        signIn,
        signOut,
        requestTemporaryPassword,
        setNewPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
