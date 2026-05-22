import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok } from '../lib/http.js';
import { db } from '../lib/db.js';
import { articles, faqs } from '../db/schema.js';
import { desc, eq, asc } from 'drizzle-orm';
import { ArticleSchema, FaqSchema } from '../schemas/index.js';
import { getSetting } from '../services/settings.service.js';

const r = Router();

r.get('/articles', async (_req, res, next) => {
  try {
    const rows = await db.select().from(articles).where(eq(articles.published, true))
      .orderBy(desc(articles.pinned), desc(articles.createdAt));
    ok(res, rows);
  } catch (e) { next(e); }
});

r.get('/articles/:id', async (req, res, next) => {
  try {
    const [a] = await db.select().from(articles).where(eq(articles.id, req.params.id)).limit(1);
    ok(res, a);
  } catch (e) { next(e); }
});

r.get('/faqs', async (_req, res, next) => {
  try {
    const rows = await db.select().from(faqs).where(eq(faqs.visible, true)).orderBy(asc(faqs.order));
    ok(res, rows);
  } catch (e) { next(e); }
});

r.get('/legal', async (_req, res, next) => {
  try {
    ok(res, {
      terms: await getSetting('terms_text', ''),
      privacy: await getSetting('privacy_text', ''),
    });
  } catch (e) { next(e); }
});

// ===== ADMIN =====
r.post('/articles', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = ArticleSchema.parse(req.body);
    const [a] = await db.insert(articles).values({ ...data, authorId: req.user!.id }).returning();
    ok(res, a, 201);
  } catch (e) { next(e); }
});

r.put('/articles/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = ArticleSchema.partial().parse(req.body);
    const [a] = await db.update(articles).set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, req.params.id)).returning();
    ok(res, a);
  } catch (e) { next(e); }
});

r.delete('/articles/:id', authenticate, requireAdmin, async (req, res, next) => {
  try { await db.delete(articles).where(eq(articles.id, req.params.id)); ok(res, { ok: true }); }
  catch (e) { next(e); }
});

r.post('/faqs', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = FaqSchema.parse(req.body);
    const [f] = await db.insert(faqs).values(data).returning();
    ok(res, f, 201);
  } catch (e) { next(e); }
});

r.put('/faqs/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = FaqSchema.partial().parse(req.body);
    const [f] = await db.update(faqs).set(data).where(eq(faqs.id, req.params.id)).returning();
    ok(res, f);
  } catch (e) { next(e); }
});

r.delete('/faqs/:id', authenticate, requireAdmin, async (req, res, next) => {
  try { await db.delete(faqs).where(eq(faqs.id, req.params.id)); ok(res, { ok: true }); }
  catch (e) { next(e); }
});

r.put('/faqs/reorder/all', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const items = req.body.items as Array<{ id: string; order: number }>;
    for (const i of items) await db.update(faqs).set({ order: i.order }).where(eq(faqs.id, i.id));
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

export default r;
