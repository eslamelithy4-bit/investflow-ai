import { db } from '../lib/db.js';
import { users, transactions, settings } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { getSetting } from './settings.service.js';

/**
 * Distribute referral commissions on approved deposits.
 * L1 -> direct referrer, L2 -> their referrer, L3 -> grandparent.
 */
export async function distributeReferralCommissions(userId: string, depositAmount: number) {
  const l1Pct = Number(await getSetting('referral_l1_pct', 10));
  const l2Pct = Number(await getSetting('referral_l2_pct', 3));
  const l3Pct = Number(await getSetting('referral_l3_pct', 1));
  const enabled = Boolean(await getSetting('referral_enabled', true));
  if (!enabled) return;

  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u?.referredBy) return;

  const tiers: Array<{ refId: string | null; pct: number }> = [];
  let currentRef: string | null = u.referredBy;
  for (const pct of [l1Pct, l2Pct, l3Pct]) {
    if (!currentRef) break;
    tiers.push({ refId: currentRef, pct });
    const [parent] = await db.select().from(users).where(eq(users.id, currentRef)).limit(1);
    currentRef = parent?.referredBy ?? null;
  }

  for (const t of tiers) {
    if (!t.refId || t.pct <= 0) continue;
    const commission = (depositAmount * t.pct) / 100;
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} + ${commission}`,
          bonusTotal: sql`${users.bonusTotal} + ${commission}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, t.refId!));
      await tx.insert(transactions).values({
        userId: t.refId!,
        type: 'referral',
        amount: commission.toString(),
        status: 'approved',
        approvedAt: new Date(),
        note: `Referral commission ${t.pct}% from deposit ${depositAmount}`,
        metadata: { fromUser: userId, percent: t.pct },
      });
    });
  }
}
