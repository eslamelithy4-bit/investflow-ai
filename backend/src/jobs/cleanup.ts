import { db } from '../lib/db.js';
import { refreshTokens, activityLogs } from '../db/schema.js';
import { lt } from 'drizzle-orm';
import { makeWorker, cleanupQueue } from './queue.js';

async function cleanup() {
  await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  await db.delete(activityLogs).where(lt(activityLogs.createdAt, cutoff));
}

export function startCleanupWorker() {
  cleanupQueue.add('daily', {}, { repeat: { pattern: '0 3 * * *' } }).catch(() => {});
  return makeWorker('cleanup', async () => cleanup());
}
