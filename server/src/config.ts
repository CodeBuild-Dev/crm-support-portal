import crypto from 'crypto';

export const isProduction = process.env.NODE_ENV === 'production';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (isProduction) {
    throw new Error('JWT_SECRET must be set to at least 32 characters in production');
  }

  // Dev fallback: a random per-process secret. Sessions reset on restart.
  console.warn('[config] JWT_SECRET not set (or too short) — using a random dev secret');
  return crypto.randomBytes(32).toString('hex');
}

export const config = {
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: '7d',
  sessionCookieName: 'session',
  sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  webhookSecret: process.env.WEBHOOK_SECRET || '',
} as const;
