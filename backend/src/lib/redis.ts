import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('error', (e) => console.error('[redis]', e.message));

export const redisPub = redis.duplicate();
export const redisSub = redis.duplicate();
