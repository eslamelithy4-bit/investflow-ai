import { Request, Response, NextFunction } from 'express';
import { verifyAccess, JwtPayload } from '../lib/jwt.js';
import { fail } from '../lib/http.js';
import { db } from '../lib/db.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isAdmin: boolean;
        roleId: string | null;
        permissions: string[];
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 'Unauthorized', 401);
  try {
    const payload = verifyAccess(token) as JwtPayload;
    const [u] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!u || !u.isActive) return fail(res, 'Account disabled', 401);
    req.user = {
      id: u.id,
      email: u.email,
      isAdmin: u.isAdmin,
      roleId: u.roleId,
      permissions: [],
    };
    next();
  } catch {
    return fail(res, 'Invalid token', 401);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) return fail(res, 'Admin only', 403);
  next();
}

export function requirePermission(perm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.isAdmin) return next();
    if (!req.user?.permissions.includes(perm)) return fail(res, 'Insufficient permission', 403);
    next();
  };
}
