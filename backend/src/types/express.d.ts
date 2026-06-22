import { Role } from '@prisma/client';

/** Augment Express' Request with the authenticated principal + request id. */
declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
      email: string;
    }
    interface Request {
      user?: AuthUser;
      id?: string;
    }
  }
}

export {};
