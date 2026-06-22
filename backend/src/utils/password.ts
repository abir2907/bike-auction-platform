import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Password hashing via bcrypt. Bcrypt is intentionally slow and salts each
 * hash, which makes offline brute-forcing of a leaked database expensive.
 * The work factor (salt rounds) is configurable via env.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
