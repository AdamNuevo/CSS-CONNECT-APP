import type { PublicUser } from './user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginResponse {
  user: PublicUser;
  tokens: AuthTokens;
  mustChangePassword: boolean;
}

export interface RefreshResponse {
  tokens: AuthTokens;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
