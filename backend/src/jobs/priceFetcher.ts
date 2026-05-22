import { redis } from '../lib/redis.js';
import { db } from '../lib/db.js';
import { priceSnapshots } from '../db/schema.js';
import { emitPrices } from '../socket/index.js';
import { logger } from '../lib/logger.js';

const PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT'];
const REST = process.env.BINANCE_REST_URL || 'https://api.binance.com';

let lastPersist = 0;

export async function fetchAndBroadcast() {
  try {
    const url = `${REST}/api/v3/ticker/price?symbols=${encodeURIComponent(JSON.stringify(PAIRS))}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = (await res.json()) as Array<{ symbol: string; price: string }>;
    const map: Record<string, number> = {};
    for (const p of data) map[p.symbol] = Number(p.price);
    await redis.set('prices:current', JSON.stringify(map), 'EX', 10);
    emitPrices(map);
    if (Date.now() - lastPersist > 60 * 60 * 1000) {
      lastPersist = Date.now();
      for (const [pair, price] of Object.entries(map)) {
        await db.insert(priceSnapshots).values({ pair, price: price.toString() });
      }
    }
  } catch (e: any) {
    logger.debug({ err: e?.message }, 'price fetch failed');
  }
}

export function startPriceFetcher() {
  setInterval(fetchAndBroadcast, 5000);
  fetchAndBroadcast().catch(() => {});
}
