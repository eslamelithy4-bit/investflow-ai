import { Router } from 'express';
import { ok, fail, HttpError } from '../lib/http.js';
import * as svc from '../services/auth.service.js';
import { SignupSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../schemas/index.js';
import { authenticate } from '../middleware/authenticate.js';
import { db } from '../lib/db.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { emailQueue } from '../jobs/queue.js';
import { emailTemplates } from '../services/email.service.js';

const r = Router();
const COOKIE_NAME = 'rt';

function setRefreshCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

r.post('/signup', async (req, res, next) => {
  try {
    const data = SignupSchema.parse(req.body);
    const tokens = await svc.signup(data);
    setRefreshCookie(res, tokens.refreshToken);
    emailQueue.add('welcome', {
      to: data.email, subject: 'Welcome to AlphaNex', html: emailTemplates.welcome(data.email),
    }).catch(() => {});
    ok(res, { accessToken: tokens.accessToken, user: { id: tokens.userId, email: tokens.email, isAdmin: tokens.isAdmin } }, 201);
  } catch (e) { next(e); }
});

r.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await svc.login(email, password);
    if ('requires2fa' in result) return ok(res, { requires2fa: true, userId: result.userId });
    setRefreshCookie(res, result.refreshToken);
    ok(res, { accessToken: result.accessToken, user: { id: result.userId, email: result.email, isAdmin: result.isAdmin } });
  } catch (e) { next(e); }
});

r.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new HttpError(401, 'Missing refresh token');
    const result = await svc.rotateRefresh(token);
    setRefreshCookie(res, result.refreshToken);
    ok(res, { accessToken: result.accessToken });
  } catch (e) { next(e); }
});

r.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) await svc.revokeRefresh(token);
    res.clearCookie(COOKIE_NAME, { path: '/api/auth' });
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const result = await svc.createPasswordResetToken(email);
    if (result) {
      const link = `${process.env.FRONTEND_URL}/reset-password?token=${result.token}`;
      emailQueue.add('reset', {
        to: email, subject: 'Reset your password', html: emailTemplates.resetPassword(link),
      }).catch(() => {});
    }
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = ResetPasswordSchema.parse(req.body);
    await svc.consumePasswordResetToken(token, newPassword);
    ok(res, { ok: true });
  } catch (e) { next(e); }
});

r.post('/verify-2fa', async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) throw new HttpError(400, 'Missing fields');
    const { authenticator } = await import('otplib');
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!u || !u.twoFaSecret) throw new HttpError(400, '2FA not configured');
    const valid = authenticator.verify({ token: code, secret: u.twoFaSecret });
    if (!valid) throw new HttpError(401, 'Invalid 2FA code');
    const tokens = await svc.issueTokens(u.id, u.email, u.isAdmin);
    setRefreshCookie(res, tokens.refreshToken);
    ok(res, { accessToken: tokens.accessToken, user: { id: u.id, email: u.email, isAdmin: u.isAdmin } });
  } catch (e) { next(e); }
});

r.get('/me', authenticate, async (req, res, next) => {
  try {
    const [u] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!u) return fail(res, 'Not found', 404);
    const { passwordHash, twoFaSecret, ...safe } = u;
    ok(res, safe);
  } catch (e) { next(e); }
});

export default r;
