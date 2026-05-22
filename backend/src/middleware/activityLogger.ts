import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/db.js';
import { activityLogs } from '../db/schema.js';

export function logActivity(action: string, entityType?: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await db.insert(activityLogs).values({
        actorId: req.user?.id ?? null,
        actorEmail: req.user?.email ?? 'anonymous',
        action,
        entityType: entityType ?? null,
        entityId: (req.params.id as string) || null,
        ipAddress: req.ip ?? null,
        userAgent: req.headers['user-agent'] ?? null,
        metadata: { method: req.method, path: req.path, body: sanitize(req.body) },
      });
    } catch {
      /* swallow */
    }
    next();
  };
}

function sanitize(body: any) {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  for (const k of ['password', 'newPassword', 'currentPassword', 'twoFaCode', 'token']) {
    if (k in clone) clone[k] = '***';
  }
  return clone;
}
