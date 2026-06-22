import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Centralised, validated environment configuration.
 *
 * We parse `process.env` through a Zod schema once at boot. If anything is
 * missing or malformed the process exits immediately with a readable error —
 * this prevents the classic "undefined env var blows up in production at 3am"
 * failure mode and gives us a single typed source of truth for config.
 */
const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? def : v.toLowerCase() === 'true'));

const num = (def: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? def : Number(v)))
    .pipe(z.number());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: num(4000),
  APP_NAME: z.string().default('Vutto Auctions'),

  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: bool(false),

  BCRYPT_SALT_ROUNDS: num(12),

  RATE_LIMIT_WINDOW_MS: num(15 * 60 * 1000),
  RATE_LIMIT_MAX: num(300),
  AUTH_RATE_LIMIT_MAX: num(20),

  AUCTION_TICK_MS: num(5000),
  AUCTION_ANTISNIPE_SECONDS: num(30),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: num(587),
  SMTP_SECURE: bool(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Vutto Auctions <no-reply@vutto.local>'),

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  METRICS_ENABLED: bool(true),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@vutto.local'),
  SEED_ADMIN_PASSWORD: z.string().default('Admin@12345'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
