import { Role, User } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, verifyPassword } from '../../utils/password';
import {
  generateRefreshTokenRaw,
  hashToken,
  signAccessToken,
  ttlToMs,
} from '../../utils/jwt';
import { audit } from '../../utils/audit';
import { passwordResetEmail, sendEmail } from '../../services/email.service';
import { logger } from '../../config/logger';

export interface RequestCtx {
  ip?: string;
  userAgent?: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export type PublicUser = Pick<
  User,
  'id' | 'name' | 'email' | 'phone' | 'role' | 'avatarUrl' | 'emailVerified' | 'createdAt'
>;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  emailVerified: true,
  createdAt: true,
} as const;

/** Mint an access token + a rotating refresh token (only the hash is stored). */
async function issueTokens(
  user: Pick<User, 'id' | 'role' | 'email'>,
  ctx: RequestCtx,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = generateRefreshTokenRaw();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + ttlToMs(env.JWT_REFRESH_TTL)),
      createdByIp: ctx.ip,
      userAgent: ctx.userAgent?.slice(0, 255),
    },
  });
  return { accessToken, refreshToken };
}

export async function register(
  input: { name: string; email: string; phone?: string; password: string },
  ctx: RequestCtx,
): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      role: Role.USER,
    },
    select: publicUserSelect,
  });

  const tokens = await issueTokens(user, ctx);
  audit({ userId: user.id, action: 'AUTH_REGISTER', entity: 'User', entityId: user.id, ip: ctx.ip });
  return { user, ...tokens };
}

export async function login(
  input: { email: string; password: string },
  ctx: RequestCtx,
): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-ish failure path: same generic message whether the email exists
  // or the password is wrong, to avoid leaking which accounts exist.
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    audit({ action: 'AUTH_LOGIN_FAILED', metadata: { email }, ip: ctx.ip });
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  const tokens = await issueTokens(user, ctx);
  audit({ userId: user.id, action: 'AUTH_LOGIN', entity: 'User', entityId: user.id, ip: ctx.ip });
  return {
    user: pick(user),
    ...tokens,
  };
}

/**
 * Refresh-token rotation with reuse detection.
 * - Valid token → revoke it, issue a brand-new pair.
 * - Token already revoked (replay) → treat as compromise: revoke EVERY token
 *   for that user, forcing re-login on all devices.
 */
export async function refresh(rawToken: string, ctx: RequestCtx): Promise<AuthResult> {
  if (!rawToken) throw ApiError.unauthorized('Missing refresh token');
  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored) throw ApiError.unauthorized('Invalid refresh token');

  if (stored.revokedAt || stored.expiresAt < new Date()) {
    if (stored.revokedAt) {
      // Reuse of a rotated token → likely theft. Nuke the family.
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      audit({ userId: stored.userId, action: 'AUTH_REFRESH_REUSE', ip: ctx.ip });
    }
    throw ApiError.unauthorized('Refresh token expired or revoked');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokens(stored.user, ctx);
  return { user: pick(stored.user), ...tokens };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function me(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function forgotPassword(email: string, ctx: RequestCtx): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always succeed silently to prevent account enumeration.
  if (!user) return;

  const rawToken = generateRefreshTokenRaw();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Vutto Auctions password',
      html: passwordResetEmail(user.name, resetUrl),
      text: `Reset your password: ${resetUrl}`,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to send password reset email');
  }
  audit({ userId: user.id, action: 'AUTH_FORGOT_PASSWORD', ip: ctx.ip });
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(newPassword) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions after a password change.
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  audit({ userId: record.userId, action: 'AUTH_RESET_PASSWORD' });
}

function pick(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}
