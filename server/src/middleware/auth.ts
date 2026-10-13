import type { Request, RequestHandler } from 'express';
import type { UserRole } from 'shared';
import { authService, type AuthUser } from '../services/auth.service.js';
import { config } from '../config.js';
import { AppError } from './errorHandler.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

async function authenticate(req: Request): Promise<AuthUser> {
  const token = req.cookies?.[config.sessionCookieName];
  const payload = token ? authService.verifyToken(token) : null;
  const user = payload ? await authService.getActiveUser(payload.sub) : null;
  if (!user) throw new AppError(401, 'Authentication required');
  return user;
}

/** Rejects the request unless it carries a valid session for an active user. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    req.user = await authenticate(req);
    next();
  } catch (err) {
    next(err);
  }
};

/** Authenticates, then rejects the request unless the user has one of the given roles. */
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  async (req, _res, next) => {
    try {
      req.user = await authenticate(req);
      if (!roles.includes(req.user.role)) {
        throw new AppError(403, 'You do not have permission to do this');
      }
      next();
    } catch (err) {
      next(err);
    }
  };

/** Can manage content and tickets. */
export const requireEditor: RequestHandler = requireRole('super_admin', 'admin', 'editor');

/** Can change site-wide settings (AI, email). */
export const requireAdmin: RequestHandler = requireRole('super_admin', 'admin');
