import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok } from '../lib/http.js';
import { db } from '../lib/db.js';
import { networks } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { NetworkSchema } from '../schemas/index.js';

const r = Router();

r.get('/', async (_req, res, next) => {
  try {
    const rows = await db.select().from(networks).where(eq(networks.enabled, true));
    ok(res, rows);
  } catch (e) { next(e); }
});

r.get('/all', authenticate, requireAdmin, async (_req, res, next) => {
  try { ok(res, await db.select().from(networks)); } catch (e) { next(e); }
});

r.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = NetworkSchema.parse(req.body);
    const [n] = await db.insert(networks).values({
      ...data,
      minDeposit: data.minDeposit.toString(),
      maxDeposit: data.maxDeposit.toString(),
      fee: data.fee.toString(),
    } as any).returning();
    ok(res, n, 201);
  } catch (e) { next(e); }
});

r.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = NetworkSchema.partial().parse(req.body);
    const update: any = { ...data };
    if (data.minDeposit !== undefined) update.minDeposit = data.minDeposit.toString();
    if (data.maxDeposit !== undefined) update.maxDeposit = data.maxDeposit.toString();
    if (data.fee !== undefined) update.fee = data.fee.toString();
    const [n] = await db.update(networks).set(update).where(eq(networks.id, req.params.id)).returning();
    ok(res, n);
  } catch (e) { next(e); }
});

r.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await db.delete(networks).where(eq(networks.id, req.params.id));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

export default r;
