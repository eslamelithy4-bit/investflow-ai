import { db } from '../lib/db.js';
import { settings } from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { redis } from '../lib/redis.js';

const CACHE_KEY = 'settings:public';
const CACHE_TTL = 60;

const PUBLIC_KEYS = new Set([
  'brand_name', 'intro_title', 'intro_text', 'logo_url', 'signup_bg_url', 'signup_bg_video_url',
  'primary_color', 'accent_color', 'bg_color', 'font_family', 'font_size', 'theme_mode',
  'social_login', 'two_fa_enabled', 'forgot_password_enabled', 'login_error_msg',
  'signup_success_msg', 'auto_login_after_signup', 'show_bonus_in_withdrawable',
  'default_chart_type', 'allow_chart_change', 'show_fibonacci', 'show_ma', 'show_rsi',
  'show_ai_news', 'allow_theme_toggle', 'allow_currency_toggle', 'terms_text', 'privacy_text',
  'texts', 'referral_link_pattern', 'withdraw_min', 'bonus_frequency',
]);

export async function getSetting<T = any>(key: string, fallback: T): Promise<T> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (!row) return fallback;
  return (row.value as any) ?? fallback;
}

export async function setSetting(key: string, value: any, updatedBy?: string) {
  const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing) {
    await db.update(settings).set({ value, updatedBy: updatedBy ?? null, updatedAt: new Date() }).where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values({ key, value, updatedBy: updatedBy ?? null });
  }
  await redis.del(CACHE_KEY);
}

export async function getAllSettings() {
  const rows = await db.select().from(settings);
  const out: Record<string, any> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function getPublicSettings() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);
  const rows = await db.select().from(settings);
  const out: Record<string, any> = {};
  for (const r of rows) if (PUBLIC_KEYS.has(r.key)) out[r.key] = r.value;
  await redis.set(CACHE_KEY, JSON.stringify(out), 'EX', CACHE_TTL);
  return out;
}

export async function bulkUpdateSettings(patch: Record<string, any>, updatedBy?: string) {
  const keys = Object.keys(patch);
  if (!keys.length) return;
  const existing = await db.select().from(settings).where(inArray(settings.key, keys));
  const existingMap = new Map(existing.map((e) => [e.key, e]));
  for (const key of keys) {
    const value = patch[key];
    const cur = existingMap.get(key);
    if (cur) {
      await db.update(settings).set({ value, updatedBy: updatedBy ?? null, updatedAt: new Date() }).where(eq(settings.id, cur.id));
    } else {
      await db.insert(settings).values({ key, value, updatedBy: updatedBy ?? null });
    }
  }
  await redis.del(CACHE_KEY);
}
