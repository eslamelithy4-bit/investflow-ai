import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TxType = "deposit" | "withdraw" | "bonus" | "profit" | "referral";
export type TxStatus = "pending" | "approved" | "rejected";

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  network?: string;
  address?: string;
  proofImage?: string;
  note?: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  password: string;
  referralCode: string;
  referredBy?: string;
  isAdmin: boolean;
  active: boolean;
  balance: number;
  depositTotal: number;
  bonusTotal: number;
  profitTotal: number;
  lastBonusClaim?: number;
  lastProfitDate?: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  createdAt: number;
}

export interface SignupField {
  id: string;
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "password" | "date" | "select";
  required: boolean;
  visible: boolean;
  helper?: string;
  options?: string;
}
export interface Network {
  id: string;
  coin: string;
  network: string;
  address: string;
  minDeposit: number;
  maxDeposit: number;
  fee: number;
  feeType: "fixed" | "percent";
  enabled: boolean;
  forWithdraw: boolean;
}
export interface Language { id: string; code: string; name: string; enabled: boolean; }
export interface Role { id: string; name: string; perms: string[]; }
export interface FAQ { id: string; q: string; a: string; }
export interface Article { id: string; title: string; body: string; pinned: boolean; createdAt: number; }
export interface DashboardButton { id: string; key: string; label: string; icon: string; visible: boolean; order: number; }
export interface BonusTier { id: string; name: string; minBalance: number; bonus: number; }
export interface AIAlgo { id: string; name: string; weight: number; enabled: boolean; }
export interface ActivityLog { id: string; actor: string; action: string; createdAt: number; }
export interface PaymentProvider { id: string; name: string; type: string; enabled: boolean; countries: string; }
export interface PageTemplate { id: string; name: string; layout: string; active: boolean; }

interface Settings {
  walletAddress: string;
  dailyBonus: number;
  profitMin: number;
  profitMax: number;
  referralL1: number;
  referralL2: number;
  referralL3: number;
  referralEnabled: boolean;
  introTitle: string;
  introText: string;
  brandName: string;
  // theme
  primaryColor: string; // hsl values "262 83% 58%"
  accentColor: string;
  bgColor: string;
  fontFamily: string;
  fontSize: number;
  themeMode: "light" | "dark" | "user";
  logoUrl: string;
  signupBgUrl: string;
  signupBgVideoUrl: string;
  // auth
  socialLogin: { google: boolean; facebook: boolean; apple: boolean };
  twoFAEnabled: boolean;
  forgotPasswordEnabled: boolean;
  loginErrorMsg: string;
  signupSuccessMsg: string;
  autoLoginAfterSignup: boolean;
  // deposit/withdraw
  autoApproveDepositUnder: number;
  withdrawMin: number;
  withdraw2FA: boolean;
  withdrawFee: number;
  withdrawFeeType: "fixed" | "percent";
  withdrawFeeBy: "user" | "company";
  showBonusInWithdrawable: boolean;
  // referral
  referralReportsEnabled: boolean;
  referralLinkPattern: string; // e.g. https://site.com/ref/{code}
  // bonus
  bonusFrequency: "daily" | "weekly" | "monthly";
  bonusRequireKYC: boolean;
  bonusRequireRefs: number;
  // trade
  defaultChartType: "line" | "candle" | "bar";
  allowChartChange: boolean;
  showFibonacci: boolean;
  showMA: boolean;
  showRSI: boolean;
  showAINews: boolean;
  // balance
  profitFrequency: "daily" | "weekly";
  profitMode: "fixed" | "tiered" | "market";
  historyDays: number;
  allowThemeToggle: boolean;
  allowCurrencyToggle: boolean;
  // approvals
  multiLevelApprovals: boolean;
  // pages
  texts: Record<string, string>;
  // legal
  termsText: string;
  privacyText: string;
}

interface AppState {
  users: User[];
  transactions: Transaction[];
  notifications: Notification[];
  settings: Settings;
  currentUserId: string | null;

  signupFields: SignupField[];
  networks: Network[];
  languages: Language[];
  roles: Role[];
  faqs: FAQ[];
  articles: Article[];
  dashboardButtons: DashboardButton[];
  bonusTiers: BonusTier[];
  aiAlgos: AIAlgo[];
  activityLogs: ActivityLog[];
  paymentProviders: PaymentProvider[];
  pageTemplates: PageTemplate[];
  currentLang: string;

  signup: (data: Omit<User, "id" | "isAdmin" | "active" | "balance" | "depositTotal" | "bonusTotal" | "profitTotal" | "createdAt" | "referralCode">) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  currentUser: () => User | null;

  requestDeposit: (amount: number, network: string, proofImage?: string) => void;
  requestWithdraw: (amount: number, network: string, address: string, note?: string) => { ok: boolean; error?: string };
  claimDailyBonus: () => { ok: boolean; error?: string };
  claimDailyProfit: () => { ok: boolean; error?: string };

  approveTx: (id: string, newAmount?: number) => void;
  rejectTx: (id: string) => void;

  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  markNotifRead: (id: string) => void;
  clearNotifs: () => void;

  addItem: (key: string, item: any) => void;
  updateItem: (key: string, id: string, patch: any) => void;
  removeItem: (key: string, id: string) => void;
  logActivity: (action: string) => void;
  setLang: (code: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const refCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const defaultSignupFields: SignupField[] = [
  { id: uid(), key: "email", label: "البريد الإلكتروني", type: "email", required: true, visible: true },
  { id: uid(), key: "phone", label: "رقم الهاتف", type: "tel", required: true, visible: true },
  { id: uid(), key: "password", label: "كلمة المرور", type: "password", required: true, visible: true, helper: "6 أحرف على الأقل" },
  { id: uid(), key: "country", label: "بلد الإقامة", type: "select", required: false, visible: false, options: "مصر,السعودية,الإمارات,المغرب,الجزائر,تونس,العراق,الأردن,سوريا,لبنان,اليمن,ليبيا" },
  { id: uid(), key: "birthdate", label: "تاريخ الميلاد", type: "date", required: false, visible: false },
];

const defaultNetworks: Network[] = [
  { id: uid(), coin: "USDT", network: "TRC20", address: "TUcvmW3WAFYJ2E2yKGr67ieSzjME1sqt8z", minDeposit: 10, maxDeposit: 100000, fee: 0, feeType: "fixed", enabled: true, forWithdraw: true },
  { id: uid(), coin: "USDT", network: "ERC20", address: "0xAbC123...", minDeposit: 50, maxDeposit: 100000, fee: 5, feeType: "fixed", enabled: true, forWithdraw: true },
  { id: uid(), coin: "BTC", network: "BTC", address: "bc1qxy...", minDeposit: 0.001, maxDeposit: 10, fee: 0.0001, feeType: "fixed", enabled: true, forWithdraw: false },
  { id: uid(), coin: "ETH", network: "ERC20", address: "0xDef456...", minDeposit: 0.01, maxDeposit: 100, fee: 0.001, feeType: "fixed", enabled: false, forWithdraw: false },
];

const defaultDashboardButtons: DashboardButton[] = [
  { id: uid(), key: "/deposit", label: "الإيداع", icon: "ArrowDownToLine", visible: true, order: 1 },
  { id: uid(), key: "/withdraw", label: "السحب", icon: "ArrowUpFromLine", visible: true, order: 2 },
  { id: uid(), key: "/referral", label: "الإحالة", icon: "Users", visible: true, order: 3 },
  { id: uid(), key: "/bonus", label: "المكافآت", icon: "Gift", visible: true, order: 4 },
  { id: uid(), key: "/trade", label: "التداول", icon: "LineChart", visible: true, order: 5 },
  { id: uid(), key: "/balance", label: "الرصيد", icon: "Wallet", visible: true, order: 6 },
];

const defaultUsers: User[] = [
  {
    id: uid(),
    email: "user@aitrade.app",
    phone: "0000000000",
    password: "User@123456",
    isAdmin: false,
    active: true,
    balance: 0,
    depositTotal: 0,
    bonusTotal: 0,
    profitTotal: 0,
    createdAt: Date.now(),
    referralCode: refCode(),
  },
  {
    id: uid(),
    email: "admin@aitrade.app",
    phone: "0000000001",
    password: "Admin@123456",
    isAdmin: true,
    active: true,
    balance: 0,
    depositTotal: 0,
    bonusTotal: 0,
    profitTotal: 0,
    createdAt: Date.now(),
    referralCode: refCode(),
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: defaultUsers,
      transactions: [],
      notifications: [],
      currentUserId: null,
      currentLang: "ar",
      signupFields: defaultSignupFields,
      networks: defaultNetworks,
      languages: [
        { id: uid(), code: "ar", name: "العربية", enabled: true },
        { id: uid(), code: "en", name: "English", enabled: true },
        { id: uid(), code: "fr", name: "Français", enabled: false },
      ],
      roles: [
        { id: uid(), name: "Admin", perms: ["read", "create", "update", "delete", "approve"] },
        { id: uid(), name: "User", perms: ["read"] },
        { id: uid(), name: "Finance", perms: ["read", "approve"] },
        { id: uid(), name: "Support", perms: ["read", "update"] },
      ],
      faqs: [
        { id: uid(), q: "كيف يمكنني الإيداع؟", a: "اذهب إلى صفحة الإيداع، اختر الشبكة، حوّل المبلغ، وارفع إثبات التحويل." },
        { id: uid(), q: "متى تتم الموافقة على السحب؟", a: "خلال 24 ساعة عمل بعد المراجعة." },
      ],
      articles: [
        { id: uid(), title: "أهلاً بكم في المنصة", body: "تابعوا التحديثات الدورية لأخبار السوق.", pinned: true, createdAt: Date.now() },
      ],
      dashboardButtons: defaultDashboardButtons,
      bonusTiers: [
        { id: uid(), name: "برونزي", minBalance: 0, bonus: 0.5 },
        { id: uid(), name: "فضي", minBalance: 500, bonus: 1 },
        { id: uid(), name: "ذهبي", minBalance: 2000, bonus: 2.5 },
      ],
      aiAlgos: [
        { id: uid(), name: "تحليل الاتجاه", weight: 50, enabled: true },
        { id: uid(), name: "تحليل المشاعر", weight: 30, enabled: true },
        { id: uid(), name: "RSI + MA Cross", weight: 20, enabled: false },
      ],
      activityLogs: [],
      paymentProviders: [
        { id: uid(), name: "Binance Pay", type: "wallet", enabled: false, countries: "ALL" },
        { id: uid(), name: "Stripe", type: "card", enabled: false, countries: "EU,US" },
      ],
      pageTemplates: [
        { id: uid(), name: "الافتراضي", layout: "grid-2", active: true },
        { id: uid(), name: "حملة رمضان", layout: "grid-3", active: false },
      ],
      settings: {
        walletAddress: "TUcvmW3WAFYJ2E2yKGr67ieSzjME1sqt8z",
        dailyBonus: 0.5,
        profitMin: 1,
        profitMax: 8,
        referralL1: 10,
        referralL2: 3,
        referralL3: 1,
        referralEnabled: true,
        introTitle: "AlphaNex AI Trade — منصة الاستثمار الذكي",
        introText:
          "نحن شركة استثمارية عالمية تعتمد على خوارزميات الذكاء الاصطناعي لتحليل أسواق العملات الرقمية وتنفيذ صفقات تداول ذكية، نضمن لك تجربة سلسة وأرباحًا يومية بشفافية كاملة.",
        brandName: "AlphaNex AI Trade",
        primaryColor: "262 83% 58%",
        accentColor: "180 70% 50%",
        bgColor: "0 0% 100%",
        fontFamily: "Cairo, system-ui, sans-serif",
        fontSize: 16,
        themeMode: "user",
        logoUrl: "",
        signupBgUrl: "",
        signupBgVideoUrl: "",
        socialLogin: { google: false, facebook: false, apple: false },
        twoFAEnabled: false,
        forgotPasswordEnabled: true,
        loginErrorMsg: "البريد أو كلمة المرور غير صحيحة",
        signupSuccessMsg: "تم إنشاء حسابك بنجاح، يمكنك تسجيل الدخول الآن",
        autoLoginAfterSignup: false,
        autoApproveDepositUnder: 0,
        withdrawMin: 10,
        withdraw2FA: false,
        withdrawFee: 1,
        withdrawFeeType: "percent",
        withdrawFeeBy: "user",
        showBonusInWithdrawable: true,
        referralReportsEnabled: false,
        referralLinkPattern: "https://aitrade.app/ref/{code}",
        bonusFrequency: "daily",
        bonusRequireKYC: false,
        bonusRequireRefs: 0,
        defaultChartType: "line",
        allowChartChange: true,
        showFibonacci: false,
        showMA: true,
        showRSI: false,
        showAINews: true,
        profitFrequency: "daily",
        profitMode: "tiered",
        historyDays: 90,
        allowThemeToggle: true,
        allowCurrencyToggle: true,
        multiLevelApprovals: false,
        texts: {},
        termsText: "بنود الاستخدام: يحظر الاحتيال أو إساءة استخدام المنصة...",
        privacyText: "سياسة الخصوصية: نلتزم بحماية بياناتك الشخصية وفق المعايير الدولية...",
      },

      signup: (data) => {
        const { users } = get();
        if (users.some((u) => u.email === data.email)) return { ok: false, error: "البريد مسجّل مسبقًا" };
        const isFirst = users.length === 0;
        const referrer = data.referredBy ? users.find((u) => u.referralCode === data.referredBy) : undefined;
        const user: User = {
          ...data,
          id: uid(),
          referralCode: refCode(),
          referredBy: referrer?.id,
          isAdmin: isFirst,
          active: true,
          balance: 0,
          depositTotal: 0,
          bonusTotal: 0,
          profitTotal: 0,
          createdAt: Date.now(),
        };
        set({ users: [...users, user] });
        if (isFirst) {
          set((s) => ({
            notifications: [
              { id: uid(), message: `أهلاً بالإدمن ${user.email}`, type: "success", read: false, createdAt: Date.now() },
              ...s.notifications,
            ],
          }));
        }
        return { ok: true };
      },

      login: (email, password) => {
        const u = get().users.find((x) => x.email === email && x.password === password);
        if (!u) return { ok: false, error: "بيانات غير صحيحة" };
        if (!u.active) return { ok: false, error: "الحساب معطّل" };
        set({ currentUserId: u.id });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null }),
      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) || null;
      },

      requestDeposit: (amount, network, proofImage) => {
        const u = get().currentUser();
        if (!u) return;
        const tx: Transaction = {
          id: uid(),
          userId: u.id,
          type: "deposit",
          amount,
          status: "pending",
          network,
          proofImage,
          createdAt: Date.now(),
        };
        set((s) => ({
          transactions: [tx, ...s.transactions],
          notifications: [
            { id: uid(), message: `طلب إيداع جديد بقيمة $${amount} من ${u.email}`, type: "info", read: false, createdAt: Date.now() },
            ...s.notifications,
          ],
        }));
      },

      requestWithdraw: (amount, network, address, note) => {
        const u = get().currentUser();
        if (!u) return { ok: false, error: "غير مسجّل" };
        if (u.depositTotal <= 0) return { ok: false, error: "يجب تنفيذ إيداع أول قبل السحب" };
        if (amount > u.balance) return { ok: false, error: "الرصيد غير كافٍ" };
        const tx: Transaction = {
          id: uid(),
          userId: u.id,
          type: "withdraw",
          amount,
          status: "pending",
          network,
          address,
          note,
          createdAt: Date.now(),
        };
        set((s) => ({
          transactions: [tx, ...s.transactions],
          notifications: [
            { id: uid(), message: `طلب سحب جديد بقيمة $${amount} من ${u.email}`, type: "warning", read: false, createdAt: Date.now() },
            ...s.notifications,
          ],
        }));
        return { ok: true };
      },

      claimDailyBonus: () => {
        const u = get().currentUser();
        if (!u) return { ok: false, error: "غير مسجّل" };
        const last = u.lastBonusClaim || 0;
        if (Date.now() - last < 24 * 60 * 60 * 1000) {
          return { ok: false, error: "يمكنك المطالبة كل 24 ساعة" };
        }
        const bonus = get().settings.dailyBonus;
        get().updateUser(u.id, {
          balance: u.balance + bonus,
          bonusTotal: u.bonusTotal + bonus,
          lastBonusClaim: Date.now(),
        });
        set((s) => ({
          transactions: [
            { id: uid(), userId: u.id, type: "bonus", amount: bonus, status: "approved", createdAt: Date.now() },
            ...s.transactions,
          ],
        }));
        return { ok: true };
      },

      claimDailyProfit: () => {
        const u = get().currentUser();
        if (!u) return { ok: false, error: "غير مسجّل" };
        if (u.depositTotal <= 0) return { ok: false, error: "تحتاج إيداع لتفعيل الأرباح" };
        const today = new Date().toDateString();
        if (u.lastProfitDate === today) return { ok: false, error: "تم تحصيل ربح اليوم" };
        const { profitMin, profitMax } = get().settings;
        const pct = profitMin + Math.random() * (profitMax - profitMin);
        const profit = +((u.depositTotal * pct) / 100).toFixed(2);
        get().updateUser(u.id, {
          balance: u.balance + profit,
          profitTotal: u.profitTotal + profit,
          lastProfitDate: today,
        });
        set((s) => ({
          transactions: [
            { id: uid(), userId: u.id, type: "profit", amount: profit, status: "approved", note: `${pct.toFixed(2)}%`, createdAt: Date.now() },
            ...s.transactions,
          ],
        }));
        return { ok: true };
      },

      approveTx: (id, newAmount) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx || tx.status !== "pending") return;
        const amount = newAmount ?? tx.amount;
        const user = get().users.find((u) => u.id === tx.userId);
        if (!user) return;

        if (tx.type === "deposit") {
          get().updateUser(user.id, {
            balance: user.balance + amount,
            depositTotal: user.depositTotal + amount,
          });
          // referral commissions
          const { users, settings } = get();
          if (settings.referralEnabled && user.referredBy) {
            const l1 = users.find((u) => u.id === user.referredBy);
            if (l1) {
              const c1 = +(amount * (settings.referralL1 / 100)).toFixed(2);
              get().updateUser(l1.id, { balance: l1.balance + c1, bonusTotal: l1.bonusTotal + c1 });
              set((s) => ({
                transactions: [
                  { id: uid(), userId: l1.id, type: "referral", amount: c1, status: "approved", note: `L1 من ${user.email}`, createdAt: Date.now() },
                  ...s.transactions,
                ],
              }));
              if (l1.referredBy) {
                const l2 = users.find((u) => u.id === l1.referredBy);
                if (l2) {
                  const c2 = +(amount * (settings.referralL2 / 100)).toFixed(2);
                  get().updateUser(l2.id, { balance: l2.balance + c2, bonusTotal: l2.bonusTotal + c2 });
                  set((s) => ({
                    transactions: [
                      { id: uid(), userId: l2.id, type: "referral", amount: c2, status: "approved", note: `L2`, createdAt: Date.now() },
                      ...s.transactions,
                    ],
                  }));
                  if (l2.referredBy) {
                    const l3 = users.find((u) => u.id === l2.referredBy);
                    if (l3) {
                      const c3 = +(amount * (settings.referralL3 / 100)).toFixed(2);
                      get().updateUser(l3.id, { balance: l3.balance + c3, bonusTotal: l3.bonusTotal + c3 });
                      set((s) => ({
                        transactions: [
                          { id: uid(), userId: l3.id, type: "referral", amount: c3, status: "approved", note: `L3`, createdAt: Date.now() },
                          ...s.transactions,
                        ],
                      }));
                    }
                  }
                }
              }
            }
          }
        } else if (tx.type === "withdraw") {
          if (user.balance < amount) return;
          get().updateUser(user.id, { balance: user.balance - amount });
        }

        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, status: "approved", amount } : t)),
        }));
      },

      rejectTx: (id) => {
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, status: "rejected" } : t)),
        }));
      },

      updateUser: (id, patch) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
      },
      deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      markNotifRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      clearNotifs: () => set({ notifications: [] }),

      addItem: (key, item) => set((s: any) => ({ [key]: [{ ...item, id: item.id || uid() }, ...(s[key] || [])] })),
      updateItem: (key, id, patch) => set((s: any) => ({ [key]: (s[key] || []).map((x: any) => x.id === id ? { ...x, ...patch } : x) })),
      removeItem: (key, id) => set((s: any) => ({ [key]: (s[key] || []).filter((x: any) => x.id !== id) })),
      logActivity: (action) => set((s) => ({ activityLogs: [{ id: uid(), actor: s.users.find(u => u.id === s.currentUserId)?.email || "system", action, createdAt: Date.now() }, ...s.activityLogs].slice(0, 500) })),
      setLang: (code) => set({ currentLang: code }),
    }),
    { name: "ai-trade-store" }
  )
);
