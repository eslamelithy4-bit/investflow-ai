import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email().max(255),
  phone: z.string().min(5).max(20).optional(),
  password: z.string().min(8).max(128),
  referralCode: z.string().length(8).optional(),
  country: z.string().max(60).optional(),
  birthdate: z.string().optional(),
  extraFields: z.record(z.any()).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFaCode: z.string().length(6).optional(),
});

export const ForgotPasswordSchema = z.object({ email: z.string().email() });
export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8).max(128),
});

export const UpdateProfileSchema = z.object({
  phone: z.string().min(5).max(20).optional(),
  avatarUrl: z.string().url().optional(),
  country: z.string().max(60).optional(),
  birthdate: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const DepositSchema = z.object({
  amount: z.coerce.number().positive(),
  networkId: z.string().uuid(),
  proofImageUrl: z.string().url().optional(),
  txHash: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const WithdrawSchema = z.object({
  amount: z.coerce.number().positive(),
  networkId: z.string().uuid(),
  address: z.string().min(8).max(200),
  note: z.string().max(500).optional(),
});

export const ApproveTxSchema = z.object({
  amountOverride: z.coerce.number().positive().optional(),
  note: z.string().optional(),
});

export const RejectTxSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const SettingsPatchSchema = z.record(z.any());

export const NetworkSchema = z.object({
  coin: z.string().min(1),
  network: z.string().min(1),
  address: z.string().min(1),
  minDeposit: z.coerce.number().nonnegative().default(0),
  maxDeposit: z.coerce.number().positive().default(1_000_000),
  fee: z.coerce.number().nonnegative().default(0),
  feeType: z.enum(['fixed', 'percent']).default('fixed'),
  enabled: z.boolean().default(true),
  forWithdraw: z.boolean().default(true),
});

export const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

export const FaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export const RoleSchema = z.object({
  name: z.string().min(1),
  permissions: z.array(z.string()).default([]),
});

export const SignupFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'tel', 'password', 'date', 'select']).default('text'),
  required: z.boolean().default(false),
  visible: z.boolean().default(true),
  helper: z.string().optional(),
  options: z.string().optional(),
  order: z.number().int().default(0),
});

export const BonusTierSchema = z.object({
  name: z.string().min(1),
  minBalance: z.coerce.number().nonnegative(),
  bonusAmount: z.coerce.number().nonnegative(),
});

export const AiAlgoSchema = z.object({
  name: z.string().min(1),
  weight: z.number().int().min(0).max(100),
  enabled: z.boolean().default(true),
  config: z.record(z.any()).optional(),
});

export const LanguageSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
});

export const PaymentProviderSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  enabled: z.boolean().default(true),
  countries: z.string().default('ALL'),
  config: z.record(z.any()).optional(),
});

export const NotificationBroadcastSchema = z.object({
  userId: z.string().uuid().optional(),
  message: z.string().min(1),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  link: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});
