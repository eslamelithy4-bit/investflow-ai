import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError, fail } from '../lib/http.js';
import { logger } from '../lib/logger.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return fail(res, 'Validation error', 400, err.flatten());
  }
  if (err instanceof HttpError) {
    return fail(res, err.message, err.status, err.details);
  }
  logger.error(err);
  return fail(res, err?.message || 'Internal server error', 500);
}

export function notFound(_req: Request, res: Response) {
  return fail(res, 'Not found', 404);
}
