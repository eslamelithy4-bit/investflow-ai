import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db, pool } from '../lib/db.js';
import {
  users, settings, networks, roles, signupFields, bonusTiers, aiAlgos, languages, faqs,
} from './schema.js';

const DEFAULT_SETTINGS: Record<string, any> = {
  brand_name: 'AlphaNex AI Trade',
  intro_title: 'Welcome to AlphaNex',
  intro_text: 'AI-powered investment platform',
  primary_color: '262 83% 58%',
  accent_color: '142 71% 45%',
  bg_color: '222 47% 11%',
  font_family: 'Inter',
  font_size: '16',
  theme_mode: 'dark',
  daily_bonus: 0.5,
  profit_min: 1,
  profit_max: 8,
  referral_l1_pct: 10,
  referral_l2_pct: 3,
  referral_l3_pct: 1,
  referral_enabled: true,
  withdraw_min: 10,
  auto_approve_deposit_under: 0,
  bonus_frequency: 'daily',
  bonus_require_kyc: false,
  bonus_require_refs: 0,
  show_bonus_in_withdrawable: true,
  default_chart_type: 'line',
  allow_chart_change: true,
  show_fibonacci: true,
  show_ma: true,
  show_rsi: true,
  show_ai_news: true,
  two_fa_enabled: true,
  forgot_password_enabled: true,
  auto_login_after_signup: true,
  social_login: { google: false, facebook: false, apple: false },
  login_error_msg: 'Invalid credentials',
  signup_success_msg: 'Welcome aboard!',
  terms_text: 'Default terms of service.',
  privacy_text: 'Default privacy policy.',
  texts: {},
};

async function run() {
  console.log('🌱 Seeding...');

  // Roles
  for (const name of ['admin', 'moderator', 'support']) {
    await db.insert(roles).values({
      name, permissions: name === 'admin' ? ['read','create','update','delete','approve','export'] : ['read'],
    } as any).onConflictDoNothing();
  }

  // Settings
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(settings).values({ key, value }).onConflictDoNothing();
  }

  // Networks
  await db.insert(networks).values([
    { coin: 'USDT', network: 'TRC20', address: 'YOUR_USDT_TRC20_ADDRESS_HERE', minDeposit: '10', maxDeposit: '100000', fee: '1', feeType: 'fixed' },
    { coin: 'USDT', network: 'BEP20', address: 'YOUR_USDT_BEP20_ADDRESS_HERE', minDeposit: '10', maxDeposit: '100000', fee: '0.5', feeType: 'fixed' },
    { coin: 'BTC', network: 'BTC', address: 'YOUR_BTC_ADDRESS_HERE', minDeposit: '0.001', maxDeposit: '10', fee: '0.0005', feeType: 'fixed' },
  ] as any).onConflictDoNothing();

  // Signup fields
  const fields = [
    { key: 'email', label: 'Email', type: 'email', required: true, order: 1 },
    { key: 'phone', label: 'Phone', type: 'tel', required: false, order: 2 },
    { key: 'password', label: 'Password', type: 'password', required: true, order: 3 },
    { key: 'country', label: 'Country', type: 'text', required: false, order: 4 },
  ];
  for (const f of fields) await db.insert(signupFields).values(f as any).onConflictDoNothing();

  // Bonus tiers
  await db.insert(bonusTiers).values([
    { name: 'Bronze', minBalance: '0', bonusAmount: '0.5' },
    { name: 'Silver', minBalance: '500', bonusAmount: '2' },
    { name: 'Gold', minBalance: '5000', bonusAmount: '10' },
  ] as any).onConflictDoNothing();

  // AI algos
  await db.insert(aiAlgos).values([
    { name: 'Trend Follower', weight: 40, enabled: true },
    { name: 'Mean Reversion', weight: 30, enabled: true },
    { name: 'Sentiment AI', weight: 30, enabled: true },
  ] as any).onConflictDoNothing();

  // Languages
  await db.insert(languages).values([
    { code: 'en', name: 'English' }, { code: 'ar', name: 'العربية' },
  ] as any).onConflictDoNothing();

  // FAQs
  await db.insert(faqs).values([
    { question: 'How do I deposit?', answer: 'Go to deposit, choose network, send and upload proof.', order: 1 },
    { question: 'How do I withdraw?', answer: 'You must have at least one approved deposit.', order: 2 },
  ] as any).onConflictDoNothing();

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@alphanex.app';
  const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const hash = await bcrypt.hash(adminPwd, 12);
  const refCode = crypto.randomBytes(6).toString('base64url').slice(0, 8).toUpperCase();
  await db.insert(users).values({
    email: adminEmail, passwordHash: hash, referralCode: refCode, isAdmin: true,
  } as any).onConflictDoNothing();

  console.log(`✅ Seed complete. Admin: ${adminEmail} / ${adminPwd}`);
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
