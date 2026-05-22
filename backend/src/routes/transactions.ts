import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok, HttpError } from '../lib/http.js';
import * as svc from '../services/transaction.service.js';
import { db } from '../lib/db.js';
import { transactions } from '../db/schema.js';
import { and, desc, eq, ilike } from 'drizzle-orm';
import { DepositSchema, WithdrawSchema, ApproveTxSchema, RejectTxSchema, PaginationSchema } from '../schemas/index.js';
import { logActivity } from '../middleware/activityLogger.js';

const r = Router();
r.use(authenticate);

r.post('/deposit', logActivity('tx.deposit.create', 'transaction'), async (req, res, next) => {
  try {
    const data = DepositSchema.parse(req.body);
    const tx = await svc.createDeposit(req.user!.id, data);
    ok(res, tx, 201);
  } catch (e) { next(e); }
});

r.post('/withdraw', logActivity('tx.withdraw.create', 'transaction'), async (req, res, next) => {
  try {
    const data = WithdrawSchema.parse(req.body);
    const tx = await svc.createWithdrawal(req.user!.id, data);
    ok(res, tx, 201);
  } catch (e) { next(e); }
});

r.post('/claim-bonus', logActivity('tx.bonus.claim', 'transaction'), async (req, res, next) => {
  try { ok(res, await svc.claimDailyBonus(req.user!.id)); } catch (e) { next(e); }
});

r.post('/claim-profit', logActivity('tx.profit.claim', 'transaction'), async (req, res, next) => {
  try { ok(res, await svc.claimDailyProfit(req.user!.id)); } catch (e) { next(e); }
});

r.get('/', async (req, res, next) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const rows = await svc.listUserTransactions(req.user!.id, page, limit);
    ok(res, rows);
  } catch (e) { next(e); }
});

// ===== ADMIN =====
r.get('/all', requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, search } = PaginationSchema.parse(req.query);
    const offset = (page - 1) * limit;
    const where = search ? ilike(transactions.address, `%${search}%`) : undefined;
    const rows = await db.select().from(transactions).where(where as any)
      .orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);
    ok(res, rows);
  } catch (e) { next(e); }
});

r.put('/:id/approve', requireAdmin, logActivity('tx.approve', 'transaction'), async (req, res, next) => {
  try {
    const { amountOverride } = ApproveTxSchema.parse(req.body);
    const result = await svc.approveTransaction(req.params.id, req.user!.id, amountOverride);
    ok(res, { amount: result });
  } catch (e) { next(e); }
});

r.put('/:id/reject', requireAdmin, logActivity('tx.reject', 'transaction'), async (req, res, next) => {
  try {
    const { reason } = RejectTxSchema.parse(req.body);
    await svc.rejectTransaction(req.params.id, req.user!.id, reason);
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.get('/export/csv', requireAdmin, async (_req, res, next) => {
  try {
    const rows = await db.select().from(transactions).limit(20000);
    const header = 'id,userId,type,amount,status,network,address,fee,createdAt\n';
    const csv = rows.map((t) => [t.id, t.userId, t.type, t.amount, t.status, t.network ?? '', t.address ?? '', t.fee, t.createdAt.toISOString()].join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(header + csv);
  } catch (e) { next(e); }
});

export default r;
