import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { RedisStore } from 'rate-limit-redis';
import pinoHttp from 'pino-http';
import { v4 as uuid } from 'uuid';

import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';
import { initSocket } from './socket/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { ok } from './lib/http.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import txRoutes from './routes/transactions.js';
import settingsRoutes from './routes/settings.js';
import networksRoutes from './routes/networks.js';
import contentRoutes from './routes/content.js';
import pricesRoutes from './routes/prices.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import notifRoutes from './routes/notifications.js';

import { startProfitWorker } from './jobs/profitDistributor.js';
import { startBonusWorker } from './jobs/bonusDistributor.js';
import { startEmailWorker } from './jobs/emailWorker.js';
import { startCleanupWorker } from './jobs/cleanup.js';
import { startPriceFetcher } from './jobs/priceFetcher.js';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use((req, _res, next) => { (req as any).id = uuid(); next(); });
app.use(pinoHttp({ logger, genReqId: (req) => (req as any).id }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true,
  store: new RedisStore({ sendCommand: (...args: string[]) => (redis as any).call(...args) }),
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true,
  store: new RedisStore({ sendCommand: (...args: string[]) => (redis as any).call(...args) }),
});
const slow = slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 100, delayMs: () => 200 });

app.use('/api', generalLimiter, slow);
app.use('/api/auth', authLimiter);

app.get('/health', (_req, res) => ok(res, { status: 'ok', uptime: process.uptime() }));
app.get('/', (_req, res) => ok(res, { name: 'AlphaNex AI Trade API', version: '1.0.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', txRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/networks', networksRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notifRoutes);

app.use(notFound);
app.use(errorHandler);

initSocket(server);

const PORT = Number(process.env.PORT || 8080);
server.listen(PORT, () => logger.info(`🚀 AlphaNex API listening on :${PORT}`));

// Background workers
try {
  startEmailWorker();
  startProfitWorker();
  startBonusWorker();
  startCleanupWorker();
  startPriceFetcher();
  logger.info('✅ Background workers started');
} catch (e: any) {
  logger.warn({ err: e?.message }, 'Some background workers failed to start (Redis required)');
}

process.on('unhandledRejection', (e) => logger.error({ err: e }, 'unhandledRejection'));
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
