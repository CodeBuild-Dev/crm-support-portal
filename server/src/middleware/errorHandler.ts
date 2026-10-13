import type { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Postgres error code for a unique-constraint violation (e.g. duplicate slug).
const PG_UNIQUE_VIOLATION = '23505';

const pgErrorCode = (err: Error): string | undefined => {
  const e = err as Error & { code?: string; cause?: { code?: string } };
  return e.code ?? e.cause?.code;
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (pgErrorCode(err) === PG_UNIQUE_VIOLATION) {
    err = new AppError(409, 'An item with this slug already exists');
  }

  if (err instanceof AppError && err.statusCode < 500) {
    // Expected client errors (bad input, not logged in, …) — no stack trace needed.
    console.warn(`[${err.statusCode}] ${req.method} ${req.path} — ${err.message}`);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path} — ${err.name}: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // In development, surface the real message (missing table, bad DATABASE_URL, …).
  // In production, never leak internals to the client.
  return res.status(500).json({
    error: isProduction ? 'Internal server error' : `Internal server error: ${err.message}`,
  });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
};
