import { db } from '../lib/db.js';
import { users, transactions } from '../db/schema.js';
import { gt, isNull, or, ne, sql, and } from 'drizzle-orm';
import { getSetting } from '../services/settings.service.js';
import { makeWorker, profitQueue } from './queue.js';
import { logger } from '../lib/logger.js';

async function distribute() {
  const min = Number(await getSetting('profit_min', 1));
  const max = Number(await getSetting('profit_max', 8));
  const today = new Date().toISOString().slice(0, 10);
  const eligible = await db.select().from(users).where(
    and(gt(users.depositTotal, '0' as any), or(isNull(users.lastProfitDate), ne(users.lastProfitDate, today as any))!)
  );
  for (const u of eligible) {
    const pct = min + Math.random() * (max - min);
    const profit = (Number(u.depositTotal) * pct) / 100;
    await db.transaction(async (trx) => {
      await trx.update(users).set({
        balance: sql`${users.balance} + ${profit}`,
        profitTotal: sql`${users.profitTotal} + ${profit}`,
        lastProfitDate: today as any,
        updatedAt: new Date(),
      }).where(sql`${users.id} = ${u.id}`);
      await trx.insert(transactions).values({
        userId: u.id, type: 'profit', amount: profit.toString(), status: 'approved',
        approvedAt: new Date(), metadata: { percent: pct, batch: true },
      });
    });
  }
  logger.info({ count: eligible.length }, 'profit distribution complete');
}

export function startProfitWorker() {
  profitQueue.add('daily', {}, { repeat: { pattern: '5 0 * * *' } }).catch(() => {});
  return makeWorker('profit-distributor', async () => distribute());
}
