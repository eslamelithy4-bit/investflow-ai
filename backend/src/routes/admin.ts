import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok, HttpError } from '../lib/http.js';
import { db } from '../lib/db.js';
import {
  users, transactions, activityLogs, kycDocuments, roles, signupFields,
  bonusTiers, aiAlgos, languages, paymentProviders,
} from '../db/schema.js';
import { sql, desc, eq, and, gte } from 'drizzle-orm';
import {
  RoleSchema, SignupFieldSchema, BonusTierSchema, AiAlgoSchema,
  LanguageSchema, PaymentProviderSchema, PaginationSchema,
} from '../schemas/index.js';
import { logActivity } from '../middleware/activityLogger.js';

const r = Router();
r.use(authenticate, requireAdmin);

r.get('/dashboard', async (_req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [{ count: totalUsers }] = (await db.execute<{ count: string }>(sql`select count(*)::text as count from users` as any) as any).rows
      ? (await db.execute<{ count: string }>(sql`select count(*)::text as count from users` as any) as any).rows : [{ count: '0' }];
    const totals = (await db.execute<any>(sql`
      select
        (select count(*) from users where is_active = true)::int as active_users,
        (select count(*) from transactions where status = 'pending')::int as pending_tx,
        (select coalesce(sum(amount),0) from transactions where type='deposit' and status='approved')::text as deposit_volume,
        (select coalesce(sum(amount),0) from transactions where type='withdraw' and status='approved')::text as withdraw_volume,
        (select coalesce(sum(amount),0) from transactions where type='profit' and status='approved')::text as profit_total,
        (select count(*) from users where created_at >= ${today})::int as new_users_today
    ` as any) as any);
    const row = totals.rows?.[0] ?? totals[0] ?? {};
    ok(res, { totalUsers: Number(totalUsers), ...row });
  } catch (e) { next(e); }
});

r.get('/activity-logs', async (req, res, next) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const offset = (page - 1) * limit;
    const rows = await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
    ok(res, rows);
  } catch (e) { next(e); }
});

r.get('/kyc', async (_req, res, next) => {
  try {
    const rows = await db.select().from(kycDocuments).where(eq(kycDocuments.status, 'pending'))
      .orderBy(desc(kycDocuments.createdAt));
    ok(res, rows);
  } catch (e) { next(e); }
});

r.put('/kyc/:id', logActivity('kyc.review', 'kyc'), async (req, res, next) => {
  try {
    const { status, note } = req.body as { status: 'approved' | 'rejected'; note?: string };
    if (!['approved', 'rejected'].includes(status)) throw new HttpError(400, 'invalid status');
    const [doc] = await db.update(kycDocuments)
      .set({ status, note: note ?? null, reviewerId: req.user!.id })
      .where(eq(kycDocuments.id, req.params.id)).returning();
    if (doc && status === 'approved') {
      await db.update(users).set({ kycStatus: 'approved', updatedAt: new Date() }).where(eq(users.id, doc.userId));
    } else if (doc && status === 'rejected') {
      await db.update(users).set({ kycStatus: 'rejected', updatedAt: new Date() }).where(eq(users.id, doc.userId));
    }
    ok(res, doc);
  } catch (e) { next(e); }
});

// Generic CRUD factory
function crud<T extends { id: any }>(path: string, table: any, schema: any) {
  r.get(`/${path}`, async (_req, res, next) => {
    try { ok(res, await db.select().from(table)); } catch (e) { next(e); }
  });
  r.post(`/${path}`, async (req, res, next) => {
    try { const data = schema.parse(req.body); const [row] = await db.insert(table).values(data).returning(); ok(res, row, 201); }
    catch (e) { next(e); }
  });
  r.put(`/${path}/:id`, async (req, res, next) => {
    try {
      const data = schema.partial().parse(req.body);
      const [row] = await db.update(table).set(data).where(eq(table.id, req.params.id)).returning();
      ok(res, row);
    } catch (e) { next(e); }
  });
  r.delete(`/${path}/:id`, async (req, res, next) => {
    try { await db.delete(table).where(eq(table.id, req.params.id)); ok(res, { ok: true }); }
    catch (e) { next(e); }
  });
}

crud('roles', roles, RoleSchema);
crud('signup-fields', signupFields, SignupFieldSchema);
crud('bonus-tiers', bonusTiers, BonusTierSchema);
crud('ai-algos', aiAlgos, AiAlgoSchema);
crud('languages', languages, LanguageSchema);
crud('payment-providers', paymentProviders, PaymentProviderSchema);

r.put('/signup-fields/reorder/all', async (req, res, next) => {
  try {
    const items = req.body.items as Array<{ id: string; order: number }>;
    for (const i of items) await db.update(signupFields).set({ order: i.order }).where(eq(signupFields.id, i.id));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.post('/ai-algos/retrain', async (_req, res, next) => {
  try { ok(res, { jobId: `retrain-${Date.now()}`, queued: true }); } catch (e) { next(e); }
});

export default r;
