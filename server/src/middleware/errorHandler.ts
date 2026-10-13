import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.name}: ${err.message}`);
  if (err.stack) console.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Include the actual error message so the client can surface useful
  // diagnostics (missing table, bad DATABASE_URL, etc). This app has no
  // auth layer, so this doesn't reduce security posture further.
  return res.status(500).json({
    error: `Internal server error: ${err.message}`,
  });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
};
