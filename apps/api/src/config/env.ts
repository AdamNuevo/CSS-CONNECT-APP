import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback search order: current working directory -> apps/api -> monorepo root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const isTest = process.env.NODE_ENV === 'test';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .url()
    .default(
      isTest
        ? 'postgresql://ccs_hub_user:changeme_in_prod@localhost:5432/ccs_hub'
        : (process.env.DATABASE_URL as string)
    ),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default(
      isTest
        ? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        : (process.env.JWT_ACCESS_SECRET as string)
    ),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default(
      isTest
        ? 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'
        : (process.env.JWT_REFRESH_SECRET as string)
    ),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_FROM: z.string().email().default('noreply@ccs.qcu.edu.ph'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().default(20),
});

function loadEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;
