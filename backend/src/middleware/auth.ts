import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Extracts and verifies the Bearer access token. On success attaches
 * `req.user`. We DON'T hit the DB here — the JWT is self-contained — keeping
 * auth cheap on the hot path.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
}

/** Like `authenticate`, but does not fail when no token is present. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7).trim());
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
    } catch {
      /* ignore — treat as anonymous */
    }
  }
  next();
}

/** Role-based access control. Use after `authenticate`. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (roles.length && !roles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }
    next();
  };
}
