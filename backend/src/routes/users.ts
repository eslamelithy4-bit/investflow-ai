import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok, fail, HttpError } from '../lib/http.js';
import { db } from '../lib/db.js';
import { users, transactions, kycDocuments, notifications } from '../db/schema.js';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { UpdateProfileSchema, ChangePasswordSchema, PaginationSchema } from '../schemas/index.js';
import { logActivity } from '../middleware/activityLogger.js';

const r = Router();
r.use(authenticate);

r.get('/me', async (req, res, next) => {
  try {
    const [u] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!u) return fail(res, 'Not found', 404);
    const { passwordHash, twoFaSecret, ...safe } = u;
    ok(res, safe);
  } catch (e) { next(e); }
});

r.put('/me', async (req, res, next) => {
  try {
    const data = UpdateProfileSchema.parse(req.body);
    const [u] = await db.update(users).set({ ...data, updatedAt: new Date() } as any)
      .where(eq(users.id, req.user!.id)).returning();
    const { passwordHash, twoFaSecret, ...safe } = u;
    ok(res, safe);
  } catch (e) { next(e); }
});

r.put('/me/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    const [u] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!u) throw new HttpError(404, 'Not found');
    const okPwd = await bcrypt.compare(currentPassword, u.passwordHash);
    if (!okPwd) throw new HttpError(401, 'Wrong current password');
    const hash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.id, u.id));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.post('/me/2fa/setup', async (req, res, next) => {
  try {
    const { authenticator } = await import('otplib');
    const secret = authenticator.generateSecret();
    await db.update(users).set({ twoFaSecret: secret, updatedAt: new Date() }).where(eq(users.id, req.user!.id));
    const otpauth = authenticator.keyuri(req.user!.email, 'AlphaNex', secret);
    ok(res, { secret, otpauth });
  } catch (e) { next(e); }
});

r.post('/me/2fa/verify', async (req, res, next) => {
  try {
    const { code } = req.body;
    const { authenticator } = await import('otplib');
    const [u] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!u?.twoFaSecret) throw new HttpError(400, '2FA not initialized');
    if (!authenticator.verify({ token: code, secret: u.twoFaSecret })) throw new HttpError(401, 'Invalid code');
    await db.update(users).set({ twoFaEnabled: true, updatedAt: new Date() }).where(eq(users.id, u.id));
    ok(res, { enabled: true });
  } catch (e) { next(e); }
});

r.delete('/me/2fa', async (req, res, next) => {
  try {
    await db.update(users).set({ twoFaEnabled: false, twoFaSecret: null, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id));
    ok(res, { enabled: false });
  } catch (e) { next(e); }
});

r.get('/me/kyc', async (req, res, next) => {
  try {
    const docs = await db.select().from(kycDocuments).where(eq(kycDocuments.userId, req.user!.id));
    ok(res, docs);
  } catch (e) { next(e); }
});

r.post('/me/kyc', async (req, res, next) => {
  try {
    const { type, fileUrl } = req.body;
    if (!type || !fileUrl) throw new HttpError(400, 'type and fileUrl required');
    const [d] = await db.insert(kycDocuments).values({ userId: req.user!.id, type, fileUrl }).returning();
    await db.update(users).set({ kycStatus: 'pending', updatedAt: new Date() }).where(eq(users.id, req.user!.id));
    ok(res, d, 201);
  } catch (e) { next(e); }
});

r.get('/me/referrals', async (req, res, next) => {
  try {
    const l1 = await db.select({ id: users.id, email: users.email, createdAt: users.createdAt })
      .from(users).where(eq(users.referredBy, req.user!.id));
    const l1Ids = l1.map((u) => u.id);
    const l2 = l1Ids.length ? await db.select({ id: users.id, email: users.email, createdAt: users.createdAt, parent: users.referredBy })
      .from(users).where(sql`${users.referredBy} = ANY(${l1Ids})`) : [];
    const l2Ids = l2.map((u) => u.id);
    const l3 = l2Ids.length ? await db.select({ id: users.id, email: users.email, createdAt: users.createdAt, parent: users.referredBy })
      .from(users).where(sql`${users.referredBy} = ANY(${l2Ids})`) : [];
    ok(res, { l1, l2, l3, counts: { l1: l1.length, l2: l2.length, l3: l3.length } });
  } catch (e) { next(e); }
});

r.get('/me/notifications', async (req, res, next) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const offset = (page - 1) * limit;
    const rows = await db.select().from(notifications)
      .where(or(eq(notifications.userId, req.user!.id), sql`${notifications.userId} IS NULL`)!)
      .orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
    ok(res, rows);
  } catch (e) { next(e); }
});

r.put('/me/notifications/:id/read', async (req, res, next) => {
  try {
    await db.update(notifications).set({ read: true })
      .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user!.id)));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.delete('/me/notifications/all', async (req, res, next) => {
  try {
    await db.delete(notifications).where(eq(notifications.userId, req.user!.id));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

// ==== ADMIN ROUTES ====
r.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, search } = PaginationSchema.parse(req.query);
    const offset = (page - 1) * limit;
    const where = search
      ? or(ilike(users.email, `%${search}%`), ilike(users.phone, `%${search}%`))
      : undefined;
    const rows = await db.select().from(users).where(where as any)
      .orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    const safe = rows.map(({ passwordHash, twoFaSecret, ...rest }) => rest);
    ok(res, safe);
  } catch (e) { next(e); }
});

r.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const [u] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!u) return fail(res, 'Not found', 404);
    const { passwordHash, twoFaSecret, ...safe } = u;
    ok(res, safe);
  } catch (e) { next(e); }
});

r.put('/:id', requireAdmin, logActivity('user.update', 'user'), async (req, res, next) => {
  try {
    const allowed = ['isActive', 'isAdmin', 'roleId', 'kycStatus', 'country'];
    const patch: any = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    patch.updatedAt = new Date();
    const [u] = await db.update(users).set(patch).where(eq(users.id, req.params.id)).returning();
    const { passwordHash, twoFaSecret, ...safe } = u;
    ok(res, safe);
  } catch (e) { next(e); }
});

r.delete('/:id', requireAdmin, logActivity('user.softDelete', 'user'), async (req, res, next) => {
  try {
    await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, req.params.id));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.post('/:id/adjust-balance', requireAdmin, logActivity('user.adjustBalance', 'user'), async (req, res, next) => {
  try {
    const { delta, reason } = req.body as { delta: number; reason: string };
    if (typeof delta !== 'number' || !reason) throw new HttpError(400, 'delta and reason required');
    await db.transaction(async (trx) => {
      await trx.update(users).set({
        balance: sql`${users.balance} + ${delta}`, updatedAt: new Date(),
      }).where(eq(users.id, req.params.id));
      await trx.insert(transactions).values({
        userId: req.params.id,
        type: delta >= 0 ? 'bonus' : 'withdraw',
        amount: Math.abs(delta).toString(),
        status: 'approved', approvedAt: new Date(), approvedBy: req.user!.id,
        note: `Manual adjustment: ${reason}`,
      });
    });
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.get('/:id/transactions', requireAdmin, async (req, res, next) => {
  try {
    const rows = await db.select().from(transactions)
      .where(eq(transactions.userId, req.params.id))
      .orderBy(desc(transactions.createdAt)).limit(200);
    ok(res, rows);
  } catch (e) { next(e); }
});

r.get('/export/csv', requireAdmin, async (_req, res, next) => {
  try {
    const rows = await db.select().from(users).limit(10000);
    const header = 'id,email,phone,balance,depositTotal,profitTotal,isAdmin,isActive,createdAt\n';
    const csv = rows.map((u) => [
      u.id, u.email, u.phone ?? '', u.balance, u.depositTotal, u.profitTotal,
      u.isAdmin, u.isActive, u.createdAt.toISOString(),
    ].join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(header + csv);
  } catch (e) { next(e); }
});

export default r;
