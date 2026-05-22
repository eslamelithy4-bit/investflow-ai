import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from '../lib/redis.js';

const connection = { connection: redis as any };

export const profitQueue = new Queue('profit-distributor', connection);
export const bonusQueue = new Queue('bonus-distributor', connection);
export const emailQueue = new Queue('email-sender', connection);
export const priceQueue = new Queue('price-fetcher', connection);
export const cleanupQueue = new Queue('cleanup', connection);

export function makeWorker(name: string, processor: (job: any) => Promise<any>) {
  return new Worker(name, processor, connection);
}

export const queueEvents = new QueueEvents('profit-distributor', connection);
