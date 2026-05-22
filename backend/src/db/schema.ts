import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  pgEnum,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== ENUMS =====
export const kycStatusEnum = pgEnum('kyc_status', ['none', 'pending', 'approved', 'rejected']);
export const txTypeEnum = pgEnum('tx_type', ['deposit', 'withdraw', 'bonus', 'profit', 'referral']);
export const txStatusEnum = pgEnum('tx_status', ['pending', 'approved', 'rejected']);
export const notifTypeEnum = pgEnum('notif_type', ['info', 'success', 'warning', 'error']);
export const signupFieldTypeEnum = pgEnum('signup_field_type', [
  'text', 'email', 'tel', 'password', 'date', 'select',
]);
export const feeTypeEnum = pgEnum('fee_type', ['fixed', 'percent']);
export const kycDocStatusEnum = pgEnum('kyc_doc_status', ['pending', 'approved', 'rejected']);

// ===== ROLES =====
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  permissions: text('permissions').array().notNull().default([] as any),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== USERS =====
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    phone: text('phone').unique(),
    passwordHash: text('password_hash').notNull(),
    referralCode: text('referral_code').notNull().unique(),
    referredBy: uuid('referred_by'),
    isAdmin: boolean('is_admin').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    balance: numeric('balance', { precision: 18, scale: 8 }).notNull().default('0'),
    depositTotal: numeric('deposit_total', { precision: 18, scale: 8 }).notNull().default('0'),
    bonusTotal: numeric('bonus_total', { precision: 18, scale: 8 }).notNull().default('0'),
    profitTotal: numeric('profit_total', { precision: 18, scale: 8 }).notNull().default('0'),
    lastBonusClaim: timestamp('last_bonus_claim', { withTimezone: true }),
    lastProfitDate: date('last_profit_date'),
    kycStatus: kycStatusEnum('kyc_status').notNull().default('none'),
    twoFaSecret: text('two_fa_secret'),
    twoFaEnabled: boolean('two_fa_enabled').notNull().default(false),
    avatarUrl: text('avatar_url'),
    country: text('country'),
    birthdate: date('birthdate'),
    extraFields: jsonb('extra_fields'),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
    referralIdx: index('users_referral_idx').on(t.referralCode),
    referredByIdx: index('users_referred_by_idx').on(t.referredBy),
  })
);

// ===== TRANSACTIONS =====
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: txTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 18, scale: 8 }).notNull(),
    status: txStatusEnum('status').notNull().default('pending'),
    network: text('network'),
    address: text('address'),
    proofImageUrl: text('proof_image_url'),
    note: text('note'),
    approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    rejectedReason: text('rejected_reason'),
    txHash: text('tx_hash'),
    fee: numeric('fee', { precision: 18, scale: 8 }).notNull().default('0'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('tx_user_idx').on(t.userId),
    statusIdx: index('tx_status_idx').on(t.status),
    typeIdx: index('tx_type_idx').on(t.type),
    createdIdx: index('tx_created_idx').on(t.createdAt),
  })
);

// ===== SETTINGS (KV) =====
export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== NETWORKS =====
export const networks = pgTable('networks', {
  id: uuid('id').primaryKey().defaultRandom(),
  coin: text('coin').notNull(),
  network: text('network').notNull(),
  address: text('address').notNull(),
  minDeposit: numeric('min_deposit', { precision: 18, scale: 8 }).notNull().default('0'),
  maxDeposit: numeric('max_deposit', { precision: 18, scale: 8 }).notNull().default('1000000'),
  fee: numeric('fee', { precision: 18, scale: 8 }).notNull().default('0'),
  feeType: feeTypeEnum('fee_type').notNull().default('fixed'),
  enabled: boolean('enabled').notNull().default(true),
  forWithdraw: boolean('for_withdraw').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== SIGNUP FIELDS =====
export const signupFields = pgTable('signup_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  type: signupFieldTypeEnum('type').notNull().default('text'),
  required: boolean('required').notNull().default(false),
  visible: boolean('visible').notNull().default(true),
  helper: text('helper'),
  options: text('options'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== NOTIFICATIONS =====
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    type: notifTypeEnum('type').notNull().default('info'),
    read: boolean('read').notNull().default(false),
    link: text('link'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('notif_user_idx').on(t.userId),
  })
);

// ===== ARTICLES =====
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  pinned: boolean('pinned').notNull().default(false),
  published: boolean('published').notNull().default(true),
  imageUrl: text('image_url'),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== FAQS =====
export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  order: integer('order').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== BONUS TIERS =====
export const bonusTiers = pgTable('bonus_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  minBalance: numeric('min_balance', { precision: 18, scale: 8 }).notNull().default('0'),
  bonusAmount: numeric('bonus_amount', { precision: 18, scale: 8 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== AI ALGOS =====
export const aiAlgos = pgTable('ai_algos', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  weight: integer('weight').notNull().default(50),
  enabled: boolean('enabled').notNull().default(true),
  config: jsonb('config'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== ACTIVITY LOGS =====
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorEmail: text('actor_email').notNull().default(''),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    actorIdx: index('log_actor_idx').on(t.actorId),
    createdIdx: index('log_created_idx').on(t.createdAt),
  })
);

// ===== PAYMENT PROVIDERS =====
export const paymentProviders = pgTable('payment_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  countries: text('countries').notNull().default('ALL'),
  config: jsonb('config'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== LANGUAGES =====
export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ===== REFRESH TOKENS =====
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revoked: boolean('revoked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('rt_user_idx').on(t.userId),
  })
);

// ===== PRICE SNAPSHOTS =====
export const priceSnapshots = pgTable(
  'price_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pair: text('pair').notNull(),
    price: numeric('price', { precision: 18, scale: 8 }).notNull(),
    volume: numeric('volume', { precision: 18, scale: 8 }),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pairTsIdx: index('price_pair_ts_idx').on(t.pair, t.timestamp),
  })
);

// ===== KYC DOCUMENTS =====
export const kycDocuments = pgTable(
  'kyc_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    fileUrl: text('file_url').notNull(),
    status: kycDocStatusEnum('status').notNull().default('pending'),
    reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('kyc_user_idx').on(t.userId),
  })
);

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  referrer: one(users, { fields: [users.referredBy], references: [users.id], relationName: 'referrer' }),
  transactions: many(transactions),
  notifications: many(notifications),
  kycDocuments: many(kycDocuments),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  approver: one(users, { fields: [transactions.approvedBy], references: [users.id] }),
}));
