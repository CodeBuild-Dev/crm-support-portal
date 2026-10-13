import { Router, type Request } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

// `secure` follows the actual protocol (trust proxy is on), so the cookie is
// HTTPS-only in production without breaking plain-http local development.
const cookieOptions = (req: Request) => ({
  httpOnly: true,
  secure: req.secure,
  sameSite: 'lax' as const,
  path: '/',
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await authService.login(req.body.email, req.body.password);
    if (!user) throw new AppError(401, 'Invalid email or password');

    res.cookie(config.sessionCookieName, authService.signToken(user.id), {
      ...cookieOptions(req),
      maxAge: config.sessionMaxAgeMs,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(config.sessionCookieName, cookieOptions(req));
  res.status(204).end();
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
