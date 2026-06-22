import { CookieOptions, Request, Response } from 'express';
import { env, isProd } from '../../config/env';
import { ttlToMs } from '../../utils/jwt';
import { ok } from '../../utils/response';
import * as authService from './auth.service';

const REFRESH_COOKIE = 'vutto_rt';

/**
 * The refresh token lives in an httpOnly cookie so client-side JavaScript
 * (and therefore XSS) cannot read it. SameSite=None+Secure is required for the
 * cross-site setup (frontend on Vercel, API on Render).
 */
function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: env.COOKIE_SECURE || isProd ? 'none' : 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/api/auth',
    maxAge: ttlToMs(env.JWT_REFRESH_TTL),
  };
}

function ctxOf(req: Request) {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body, ctxOf(req));
  setRefreshCookie(res, result.refreshToken);
  return ok(res, { user: result.user, accessToken: result.accessToken }, 201);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body, ctxOf(req));
  setRefreshCookie(res, result.refreshToken);
  return ok(res, { user: result.user, accessToken: result.accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const result = await authService.refresh(token, ctxOf(req));
  setRefreshCookie(res, result.refreshToken);
  return ok(res, { user: result.user, accessToken: result.accessToken });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
  return ok(res, { message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  return ok(res, await authService.me(req.user!.id));
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email, ctxOf(req));
  return ok(res, { message: 'If an account exists for that email, a reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  return ok(res, { message: 'Password updated. You can now sign in.' });
}
