import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok } from '../lib/http.js';
import * as svc from '../services/settings.service.js';
import { SettingsPatchSchema } from '../schemas/index.js';
import { logActivity } from '../middleware/activityLogger.js';

const r = Router();

r.get('/public', async (_req, res, next) => {
  try { ok(res, await svc.getPublicSettings()); } catch (e) { next(e); }
});

r.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try { ok(res, await svc.getAllSettings()); } catch (e) { next(e); }
});

r.put('/', authenticate, requireAdmin, logActivity('settings.update', 'settings'), async (req, res, next) => {
  try {
    const patch = SettingsPatchSchema.parse(req.body);
    await svc.bulkUpdateSettings(patch, req.user!.id);
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

export default r;
