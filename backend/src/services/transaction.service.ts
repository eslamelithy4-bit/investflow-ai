import { db } from '../lib/db.js';
import { transactions, users, networks, notifications } from '../db/schema.js';
import { and, desc, eq, sql } from 'drizzle-orm';
import { HttpError } from '../lib/http.js';
import { getSetting } from './settings.service.js';
import { distributeReferralCommissions } from './referral.service.js';
import { emitToUser, emitToAdmins } from '../socket/index.js';

export async function createDeposit(userId: string, input: {
  amount: number; networkId: string; proofImageUrl?: string; txHash?: string; note?: string;
}) {
  const [n] = await db.select().from(networks).where(eq(networks.id, input.networkId)).limit(1);
  if (!n || !n.enabled) throw new HttpError(400, 'Network unavailable');
  if (input.amount < Number(n.minDeposit)) throw new HttpError(400, `Min deposit is ${n.minDeposit}`);
  if (input.amount > Number(n.maxDeposit)) throw new HttpError(400, `Max deposit is ${n.maxDeposit}`);

  const autoApproveUnder = Number(await getSetting('auto_approve_deposit_under', 0));
  const autoApprove = autoApproveUnder > 0 && input.amount <= autoApproveUnder;

  const [tx] = await db.insert(transactions).values({
    userId,
    type: 'deposit',
    amount: input.amount.toString(),
    status: autoApprove ? 'approved' : 'pending',
    network: `${n.coin}-${n.network}`,
    proofImageUrl: input.proofImageUrl ?? null,
    txHash: input.txHash ?? null,
    note: input.note ?? null,
    approvedAt: autoApprove ? new Date() : null,
  }).returning();

  if (autoApprove) {
    await applyDepositApproval(tx.id);
  } else {
    emitToAdmins('admin:notification', { type: 'deposit', txId: tx.id, userId, amount: input.amount });
  }
  return tx;
}

export async function createWithdrawal(userId: string, input: {
  amount: number; networkId: string; address: string; note?: string;
}) {
  const [n] = await db.select().from(networks).where(eq(networks.id, input.networkId)).limit(1);
  if (!n || !n.enabled || !n.forWithdraw) throw new HttpError(400, 'Network unavailable');

  const minWithdraw = Number(await getSetting('withdraw_min', 10));
  if (input.amount < minWithdraw) throw new HttpError(400, `Minimum withdrawal is ${minWithdraw}`);

  // require at least one approved deposit
  const [dep] = await db.select({ id: transactions.id })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.type, 'deposit'), eq(transactions.status, 'approved')))
    .limit(1);
  if (!dep) throw new HttpError(403, 'You must have at least one approved deposit before withdrawing');

  const fee = n.feeType === 'percent' ? (input.amount * Number(n.fee)) / 100 : Number(n.fee);
  const feeBy = (await getSetting('withdraw_fee_by', 'user')) as 'user' | 'company';
  const totalDeduct = feeBy === 'user' ? input.amount + fee : input.amount;

  return await db.transaction(async (trx) => {
    const [u] = await trx.execute<any>(sql`select * from users where id = ${userId} for update`).then((r: any) => r.rows ?? r);
    const balance = Number(u.balance);
    if (balance < totalDeduct) throw new HttpError(400, 'Insufficient balance');
    await trx.update(users)
      .set({ balance: sql`${users.balance} - ${totalDeduct}`, updatedAt: new Date() })
      .where(eq(users.id, userId));
    const [tx] = await trx.insert(transactions).values({
      userId,
      type: 'withdraw',
      amount: input.amount.toString(),
      status: 'pending',
      network: `${n.coin}-${n.network}`,
      address: input.address,
      fee: fee.toString(),
      note: input.note ?? null,
      metadata: { feeBy, totalDeduct },
    }).returning();
    emitToAdmins('admin:notification', { type: 'withdraw', txId: tx.id, userId, amount: input.amount });
    return tx;
  });
}

export async function applyDepositApproval(txId: string, approverId?: string, amountOverride?: number) {
  return await db.transaction(async (trx) => {
    const [tx] = await trx.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
    if (!tx) throw new HttpError(404, 'Transaction not found');
    if (tx.type !== 'deposit') throw new HttpError(400, 'Not a deposit');
    const amount = amountOverride ?? Number(tx.amount);
    await trx.update(users).set({
      balance: sql`${users.balance} + ${amount}`,
      depositTotal: sql`${users.depositTotal} + ${amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, tx.userId));
    await trx.update(transactions).set({
      status: 'approved',
      amount: amount.toString(),
      approvedBy: approverId ?? null,
      approvedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(transactions.id, txId));
    await trx.insert(notifications).values({
      userId: tx.userId,
      message: `Deposit of ${amount} approved`,
      type: 'success',
    });
    emitToUser(tx.userId, 'transaction:updated', { txId, status: 'approved' });
    // referral commissions outside lock-sensitive area
    setImmediate(() => distributeReferralCommissions(tx.userId, amount).catch(() => {}));
    return amount;
  });
}

export async function approveTransaction(txId: string, approverId: string, amountOverride?: number) {
  const [tx] = await db.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
  if (!tx) throw new HttpError(404, 'Transaction not found');
  if (tx.status !== 'pending') throw new HttpError(400, 'Already processed');

  if (tx.type === 'deposit') {
    return await applyDepositApproval(txId, approverId, amountOverride);
  }
  if (tx.type === 'withdraw') {
    await db.update(transactions).set({
      status: 'approved', approvedBy: approverId, approvedAt: new Date(), updatedAt: new Date(),
    }).where(eq(transactions.id, txId));
    await db.insert(notifications).values({
      userId: tx.userId, message: `Withdrawal of ${tx.amount} approved`, type: 'success',
    });
    emitToUser(tx.userId, 'transaction:updated', { txId, status: 'approved' });
    return Number(tx.amount);
  }
  throw new HttpError(400, 'Type cannot be approved here');
}

export async function rejectTransaction(txId: string, approverId: string, reason: string) {
  return await db.transaction(async (trx) => {
    const [tx] = await trx.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
    if (!tx) throw new HttpError(404, 'Transaction not found');
    if (tx.status !== 'pending') throw new HttpError(400, 'Already processed');
    // refund withdrawal hold
    if (tx.type === 'withdraw') {
      const meta: any = tx.metadata ?? {};
      const refund = Number(meta.totalDeduct ?? Number(tx.amount) + Number(tx.fee));
      await trx.update(users).set({
        balance: sql`${users.balance} + ${refund}`, updatedAt: new Date(),
      }).where(eq(users.id, tx.userId));
    }
    await trx.update(transactions).set({
      status: 'rejected', approvedBy: approverId, rejectedReason: reason, updatedAt: new Date(),
    }).where(eq(transactions.id, txId));
    await trx.insert(notifications).values({
      userId: tx.userId, message: `Transaction rejected: ${reason}`, type: 'error',
    });
    emitToUser(tx.userId, 'transaction:updated', { txId, status: 'rejected' });
  });
}

export async function listUserTransactions(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const rows = await db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);
  return rows;
}

export async function claimDailyBonus(userId: string) {
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) throw new HttpError(404, 'User missing');
  const requireKyc = Boolean(await getSetting('bonus_require_kyc', false));
  if (requireKyc && u.kycStatus !== 'approved') throw new HttpError(403, 'KYC approval required');
  const last = u.lastBonusClaim ? new Date(u.lastBonusClaim).getTime() : 0;
  const oneDay = 24 * 60 * 60 * 1000;
  if (Date.now() - last < oneDay) throw new HttpError(429, 'Bonus already claimed today');
  const amount = Number(await getSetting('daily_bonus', 0.5));
  return await db.transaction(async (trx) => {
    await trx.update(users).set({
      balance: sql`${users.balance} + ${amount}`,
      bonusTotal: sql`${users.bonusTotal} + ${amount}`,
      lastBonusClaim: new Date(),
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
    const [tx] = await trx.insert(transactions).values({
      userId, type: 'bonus', amount: amount.toString(), status: 'approved', approvedAt: new Date(),
    }).returning();
    return tx;
  });
}

export async function claimDailyProfit(userId: string) {
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) throw new HttpError(404, 'User missing');
  if (Number(u.depositTotal) <= 0) throw new HttpError(403, 'You need an active deposit to earn profit');
  const today = new Date().toISOString().slice(0, 10);
  if (u.lastProfitDate && String(u.lastProfitDate) === today) {
    throw new HttpError(429, 'Profit already claimed today');
  }
  const min = Number(await getSetting('profit_min', 1));
  const max = Number(await getSetting('profit_max', 8));
  const pct = min + Math.random() * (max - min);
  const profit = (Number(u.depositTotal) * pct) / 100;
  return await db.transaction(async (trx) => {
    await trx.update(users).set({
      balance: sql`${users.balance} + ${profit}`,
      profitTotal: sql`${users.profitTotal} + ${profit}`,
      lastProfitDate: today as any,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
    const [tx] = await trx.insert(transactions).values({
      userId, type: 'profit', amount: profit.toString(), status: 'approved',
      approvedAt: new Date(), metadata: { percent: pct },
    }).returning();
    return tx;
  });
}
