import rateLimit from 'express-rate-limit';

const limiter = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });

/** Brute-force protection for the login form. */
export const loginLimiter = limiter(15 * 60 * 1000, 10, 'Too many login attempts. Try again in 15 minutes.');

/** Caps AI usage per visitor so a public demo can't run up the API bill. */
export const chatLimiter = limiter(60 * 1000, 15, 'Too many messages. Please wait a minute.');

/** Stops ticket spam from the public chat widget. */
export const ticketLimiter = limiter(60 * 60 * 1000, 10, 'Too many tickets submitted. Try again later.');
