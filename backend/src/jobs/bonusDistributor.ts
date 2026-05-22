import { db } from '../lib/db.js';
import { users, transactions } from '../db/schema.js';
import { sql } from 'drizzle-orm';
import { getSetting } from '../services/settings.service.js';
import { makeWorker, bonusQueue } from './queue.js';
import { logger } from '../lib/logger.js';

async function distribute() {
  const freq = (await getSetting('bonus_frequency', 'daily')) as string;
  if (freq !== 'daily') return;
  const amount = Number(await getSetting('daily_bonus', 0.5));
  const eligible = await db.select().from(users);
  const now = Date.now();
  for (const u of eligible) {
    const last = u.lastBonusClaim ? new Date(u.lastBonusClaim).getTime() : 0;
    if (now - last < 24 * 60 * 60 * 1000) continue;
    await db.transaction(async (trx) => {
      await trx.update(users).set({
        balance: sql`${users.balance} + ${amount}`,
        bonusTotal: sql`${users.bonusTotal} + ${amount}`,
        lastBonusClaim: new Date(),
        updatedAt: new Date(),
      }).where(sql`${users.id} = ${u.id}`);
      await trx.insert(transactions).values({
        userId: u.id, type: 'bonus', amount: amount.toString(), status: 'approved', approvedAt: new Date(),
      });
    });
  }
  logger.info({ count: eligible.length }, 'bonus distribution complete');
}

export function startBonusWorker() {
  bonusQueue.add('daily', {}, { repeat: { pattern: '0 6 * * *' } }).catch(() => {});
  return makeWorker('bonus-distributor', async () => distribute());
}
