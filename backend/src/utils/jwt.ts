import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  email: string;
}

/**
 * Short-lived access token (stateless). Carries identity + role so most
 * requests can be authorised without a DB hit.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Long-lived opaque refresh token. We hand the user a random string and store
 * ONLY its SHA-256 hash in the DB — a database leak therefore does not reveal
 * usable tokens. Rotation + revocation are handled in the auth service.
 */
export function generateRefreshTokenRaw(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Parse a TTL like "7d"/"15m"/"30s" into milliseconds. */
export function ttlToMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) return Number(ttl) || 0;
  const value = Number(match[1]);
  const unit = match[2];
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
  return value * factor;
}
