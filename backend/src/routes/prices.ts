import { Router } from 'express';
import { ok, fail } from '../lib/http.js';
import { redis } from '../lib/redis.js';
import { db } from '../lib/db.js';
import { priceSnapshots } from '../db/schema.js';
import { and, desc, eq, gte } from 'drizzle-orm';

const r = Router();

r.get('/current', async (_req, res, next) => {
  try {
    const cached = await redis.get('prices:current');
    ok(res, cached ? JSON.parse(cached) : {});
  } catch (e) { next(e); }
});

r.get('/history/:pair', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await db.select().from(priceSnapshots)
      .where(and(eq(priceSnapshots.pair, req.params.pair), gte(priceSnapshots.timestamp, since))!)
      .orderBy(desc(priceSnapshots.timestamp)).limit(limit);
    ok(res, rows.reverse());
  } catch (e) { next(e); }
});

export default r;
