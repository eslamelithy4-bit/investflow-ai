import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../lib/db.js';
import { users, refreshTokens } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { signAccess, signRefresh, hashToken } from '../lib/jwt.js';
import { HttpError } from '../lib/http.js';
import { redis } from '../lib/redis.js';

function makeReferralCode() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8).toUpperCase();
}

export async function signup(input: {
  email: string;
  phone?: string;
  password: string;
  referralCode?: string;
  country?: string;
  birthdate?: string;
  extraFields?: Record<string, any>;
}) {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length) throw new HttpError(409, 'Email already registered');

  let referredBy: string | null = null;
  if (input.referralCode) {
    const [r] = await db.select().from(users).where(eq(users.referralCode, input.referralCode)).limit(1);
    if (!r) throw new HttpError(400, 'Invalid referral code');
    referredBy = r.id;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  let referralCode = makeReferralCode();
  for (let i = 0; i < 5; i++) {
    const taken = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
    if (!taken.length) break;
    referralCode = makeReferralCode();
  }

  // First user becomes admin
  const totalUsers = await db.execute<{ count: string }>('select count(*)::text as count from users' as any);
  const isFirst = Number((totalUsers as any).rows?.[0]?.count ?? 0) === 0;

  const [u] = await db
    .insert(users)
    .values({
      email: input.email,
      phone: input.phone ?? null,
      passwordHash,
      referralCode,
      referredBy,
      isAdmin: isFirst,
      country: input.country ?? null,
      birthdate: (input.birthdate as any) ?? null,
      extraFields: input.extraFields ?? null,
    })
    .returning();

  return issueTokens(u.id, u.email, u.isAdmin);
}

export async function login(email: string, password: string) {
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) throw new HttpError(401, 'Invalid credentials');
  if (!u.isActive) throw new HttpError(403, 'Account disabled');
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');
  if (u.twoFaEnabled) {
    return { requires2fa: true, userId: u.id };
  }
  return issueTokens(u.id, u.email, u.isAdmin);
}

export async function issueTokens(userId: string, email: string, isAdmin: boolean) {
  const accessToken = signAccess({ sub: userId, email, isAdmin });
  const refreshToken = signRefresh({ sub: userId, email, isAdmin });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt });
  return { accessToken, refreshToken, userId, email, isAdmin };
}

export async function rotateRefresh(oldToken: string) {
  const oldHash = hashToken(oldToken);
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, oldHash), eq(refreshTokens.revoked, false)))
    .limit(1);
  if (!row || row.expiresAt < new Date()) throw new HttpError(401, 'Invalid refresh');
  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, row.id));
  const [u] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
  if (!u) throw new HttpError(401, 'User missing');
  return issueTokens(u.id, u.email, u.isAdmin);
}

export async function revokeRefresh(token: string) {
  const h = hashToken(token);
  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.tokenHash, h));
}

export async function createPasswordResetToken(email: string) {
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) return null;
  const token = crypto.randomBytes(32).toString('hex');
  await redis.set(`pwreset:${token}`, u.id, 'EX', 900); // 15 min
  return { token, user: u };
}

export async function consumePasswordResetToken(token: string, newPassword: string) {
  const userId = await redis.get(`pwreset:${token}`);
  if (!userId) throw new HttpError(400, 'Invalid or expired token');
  await redis.del(`pwreset:${token}`);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));
}
