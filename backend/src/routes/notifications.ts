import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok } from '../lib/http.js';
import { db } from '../lib/db.js';
import { notifications } from '../db/schema.js';
import { NotificationBroadcastSchema } from '../schemas/index.js';
import { emitToUser, getIO } from '../socket/index.js';

const r = Router();
r.use(authenticate, requireAdmin);

r.post('/broadcast', async (req, res, next) => {
  try {
    const data = NotificationBroadcastSchema.parse(req.body);
    const [n] = await db.insert(notifications).values({
      userId: data.userId ?? null, message: data.message, type: data.type, link: data.link ?? null,
    }).returning();
    if (data.userId) emitToUser(data.userId, 'notification:new', n);
    else getIO().emit('notification:new', n);
    ok(res, n, 201);
  } catch (e) { next(e); }
});

export default r;
