import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, Plus, Palette, Globe, Shield, Users2, FileText, Megaphone, Wand2, Brain, Activity, CreditCard, LayoutGrid, Languages, Type } from "lucide-react";
import { toast } from "sonner";

export default function AdvancedAdmin() {
  const navigate = useNavigate();
  const me = useStore((s) => s.currentUser());
  if (!me?.isAdmin) { navigate("/dashboard"); return null; }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">لوحة التحكم المتقدمة</h1>
            <p className="text-muted-foreground text-sm">تحكم كامل بكل ما يراه المستخدم — نصوص، ألوان، حقول، شبكات، خوارزميات…</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin")}>← لوحة الإدارة الأساسية</Button>
        </div>

        <Tabs defaultValue="theme">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="theme"><Palette className="w-4 h-4 ml-1" />السمة</TabsTrigger>
            <TabsTrigger value="texts"><FileText className="w-4 h-4 ml-1" />النصوص</TabsTrigger>
            <TabsTrigger value="signup"><Wand2 className="w-4 h-4 ml-1" />التسجيل</TabsTrigger>
            <TabsTrigger value="login"><Shield className="w-4 h-4 ml-1" />الدخول</TabsTrigger>
            <TabsTrigger value="dashboard"><LayoutGrid className="w-4 h-4 ml-1" />الواجهة</TabsTrigger>
            <TabsTrigger value="networks">الشبكات</TabsTrigger>
            <TabsTrigger value="finance"><CreditCard className="w-4 h-4 ml-1" />التمويل</TabsTrigger>
            <TabsTrigger value="referral">الإحالة</TabsTrigger>
            <TabsTrigger value="bonus">المكافآت</TabsTrigger>
            <TabsTrigger value="trade">التداول</TabsTrigger>
            <TabsTrigger value="balance">الرصيد</TabsTrigger>
            <TabsTrigger value="roles"><Users2 className="w-4 h-4 ml-1" />الأدوار</TabsTrigger>
            <TabsTrigger value="content"><Megaphone className="w-4 h-4 ml-1" />المحتوى</TabsTrigger>
            <TabsTrigger value="lang"><Languages className="w-4 h-4 ml-1" />اللغات</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="w-4 h-4 ml-1" />الذكاء الاصطناعي</TabsTrigger>
            <TabsTrigger value="logs"><Activity className="w-4 h-4 ml-1" />السجلات</TabsTrigger>
            <TabsTrigger value="builder">منشئ الصفحات</TabsTrigger>
          </TabsList>

          <TabsContent value="theme"><ThemePanel /></TabsContent>
          <TabsContent value="texts"><TextsPanel /></TabsContent>
          <TabsContent value="signup"><SignupFieldsPanel /></TabsContent>
          <TabsContent value="login"><LoginPanel /></TabsContent>
          <TabsContent value="dashboard"><DashboardPanel /></TabsContent>
          <TabsContent value="networks"><NetworksPanel /></TabsContent>
          <TabsContent value="finance"><FinancePanel /></TabsContent>
          <TabsContent value="referral"><ReferralPanel /></TabsContent>
          <TabsContent value="bonus"><BonusPanel /></TabsContent>
          <TabsContent value="trade"><TradePanel /></TabsContent>
          <TabsContent value="balance"><BalancePanel /></TabsContent>
          <TabsContent value="roles"><RolesPanel /></TabsContent>
          <TabsContent value="content"><ContentPanel /></TabsContent>
          <TabsContent value="lang"><LanguagesPanel /></TabsContent>
          <TabsContent value="ai"><AIPanel /></TabsContent>
          <TabsContent value="logs"><LogsPanel /></TabsContent>
          <TabsContent value="builder"><PageBuilderPanel /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* ============= PANELS ============= */

function ThemePanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold flex items-center gap-2"><Palette className="w-5 h-5" />السمة والألوان</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div><Label>اللون الأساسي (HSL)</Label><Input value={s.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} dir="ltr" /></div>
        <div><Label>اللون الثانوي (HSL)</Label><Input value={s.accentColor} onChange={(e) => update({ accentColor: e.target.value })} dir="ltr" /></div>
        <div><Label>لون الخلفية (HSL)</Label><Input value={s.bgColor} onChange={(e) => update({ bgColor: e.target.value })} dir="ltr" /></div>
        <div className="md:col-span-2"><Label className="flex items-center gap-1"><Type className="w-4 h-4" />الخط</Label>
          <Select value={s.fontFamily} onValueChange={(v) => update({ fontFamily: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Cairo, system-ui, sans-serif">Cairo</SelectItem>
              <SelectItem value="Tajawal, system-ui, sans-serif">Tajawal</SelectItem>
              <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
              <SelectItem value="Almarai, system-ui, sans-serif">Almarai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>حجم الخط ({s.fontSize}px)</Label>
          <Slider min={12} max={22} step={1} value={[s.fontSize]} onValueChange={(v) => update({ fontSize: v[0] })} className="mt-3" />
        </div>
        <div><Label>الوضع الافتراضي</Label>
          <Select value={s.themeMode} onValueChange={(v: any) => update({ themeMode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">فاتح</SelectItem>
              <SelectItem value="dark">داكن</SelectItem>
              <SelectItem value="user">اختيار المستخدم</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2"><Switch checked={s.allowThemeToggle} onCheckedChange={(v) => update({ allowThemeToggle: v })} /><Label>السماح بتبديل المستخدم</Label></div>
        <div><Label>رابط الشعار</Label><Input value={s.logoUrl} onChange={(e) => update({ logoUrl: e.target.value })} dir="ltr" placeholder="https://..." /></div>
      </div>
      <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("تم حفظ السمة")}>حفظ</Button>
    </Card>
  );
}

function TextsPanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold">النصوص العامة</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div><Label>اسم المنصة</Label><Input value={s.brandName} onChange={(e) => update({ brandName: e.target.value })} /></div>
        <div><Label>عنوان المقدمة</Label><Input value={s.introTitle} onChange={(e) => update({ introTitle: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>نص المقدمة</Label><Textarea rows={3} value={s.introText} onChange={(e) => update({ introText: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>بنود الاستخدام</Label><Textarea rows={5} value={s.termsText} onChange={(e) => update({ termsText: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>سياسة الخصوصية</Label><Textarea rows={5} value={s.privacyText} onChange={(e) => update({ privacyText: e.target.value })} /></div>
      </div>
    </Card>
  );
}

function SignupFieldsPanel() {
  const fields = useStore((x) => x.signupFields);
  const add = useStore((x) => x.addItem);
  const upd = useStore((x) => x.updateItem);
  const rm = useStore((x) => x.removeItem);
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">حقول صفحة التسجيل (ديناميكية)</h3>
        {fields.map((f) => (
          <div key={f.id} className="grid md:grid-cols-6 gap-2 items-end border rounded-lg p-3">
            <div><Label>المفتاح</Label><Input value={f.key} onChange={(e) => upd("signupFields", f.id, { key: e.target.value })} dir="ltr" /></div>
            <div><Label>التسمية</Label><Input value={f.label} onChange={(e) => upd("signupFields", f.id, { label: e.target.value })} /></div>
            <div><Label>النوع</Label>
              <Select value={f.type} onValueChange={(v) => upd("signupFields", f.id, { type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["text", "email", "tel", "password", "date", "select"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>نص مساعد</Label><Input value={f.helper || ""} onChange={(e) => upd("signupFields", f.id, { helper: e.target.value })} /></div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2"><Switch checked={f.required} onCheckedChange={(v) => upd("signupFields", f.id, { required: v })} /><span className="text-xs">مطلوب</span></div>
              <div className="flex items-center gap-2"><Switch checked={f.visible} onCheckedChange={(v) => upd("signupFields", f.id, { visible: v })} /><span className="text-xs">ظاهر</span></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => rm("signupFields", f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => add("signupFields", { key: "newField", label: "حقل جديد", type: "text", required: false, visible: true })}>
          <Plus className="w-4 h-4 ml-1" />إضافة حقل
        </Button>
      </Card>
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">خلفية ورسالة صفحة التسجيل</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>رابط صورة الخلفية</Label><Input value={s.signupBgUrl} onChange={(e) => update({ signupBgUrl: e.target.value })} dir="ltr" /></div>
          <div><Label>رابط فيديو الخلفية</Label><Input value={s.signupBgVideoUrl} onChange={(e) => update({ signupBgVideoUrl: e.target.value })} dir="ltr" /></div>
          <div className="md:col-span-2"><Label>رسالة بعد التسجيل</Label><Textarea rows={2} value={s.signupSuccessMsg} onChange={(e) => update({ signupSuccessMsg: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Switch checked={s.autoLoginAfterSignup} onCheckedChange={(v) => update({ autoLoginAfterSignup: v })} /><Label>تسجيل دخول تلقائي بعد التسجيل</Label></div>
        </div>
      </Card>
    </div>
  );
}

function LoginPanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold">إعدادات تسجيل الدخول</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2"><Switch checked={s.socialLogin.google} onCheckedChange={(v) => update({ socialLogin: { ...s.socialLogin, google: v } })} /><Label>Google</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.socialLogin.facebook} onCheckedChange={(v) => update({ socialLogin: { ...s.socialLogin, facebook: v } })} /><Label>Facebook</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.socialLogin.apple} onCheckedChange={(v) => update({ socialLogin: { ...s.socialLogin, apple: v } })} /><Label>Apple</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.twoFAEnabled} onCheckedChange={(v) => update({ twoFAEnabled: v })} /><Label>المصادقة الثنائية</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.forgotPasswordEnabled} onCheckedChange={(v) => update({ forgotPasswordEnabled: v })} /><Label>إظهار "نسيت كلمة المرور"</Label></div>
        <div className="md:col-span-2"><Label>رسالة خطأ الدخول</Label><Input value={s.loginErrorMsg} onChange={(e) => update({ loginErrorMsg: e.target.value })} /></div>
      </div>
    </Card>
  );
}

function DashboardPanel() {
  const btns = useStore((x) => x.dashboardButtons);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <Card className="p-6 space-y-3">
      <h3 className="font-bold">أزرار لوحة المستخدم</h3>
      <p className="text-sm text-muted-foreground">إخفاء/إظهار، تغيير الترتيب، التسمية</p>
      {btns.sort((a, b) => a.order - b.order).map((b) => (
        <div key={b.id} className="grid md:grid-cols-6 gap-2 items-end border rounded-lg p-3">
          <div><Label>المسار</Label><Input value={b.key} onChange={(e) => upd("dashboardButtons", b.id, { key: e.target.value })} dir="ltr" /></div>
          <div><Label>التسمية</Label><Input value={b.label} onChange={(e) => upd("dashboardButtons", b.id, { label: e.target.value })} /></div>
          <div><Label>الأيقونة</Label><Input value={b.icon} onChange={(e) => upd("dashboardButtons", b.id, { icon: e.target.value })} dir="ltr" /></div>
          <div><Label>الترتيب</Label><Input type="number" value={b.order} onChange={(e) => upd("dashboardButtons", b.id, { order: +e.target.value })} dir="ltr" /></div>
          <div className="flex items-center gap-2"><Switch checked={b.visible} onCheckedChange={(v) => upd("dashboardButtons", b.id, { visible: v })} /><Label className="text-xs">ظاهر</Label></div>
          <Button variant="ghost" size="icon" onClick={() => rm("dashboardButtons", b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ))}
      <Button variant="outline" onClick={() => add("dashboardButtons", { key: "/new", label: "زر جديد", icon: "Star", visible: true, order: btns.length + 1 })}>
        <Plus className="w-4 h-4 ml-1" />إضافة زر
      </Button>
    </Card>
  );
}

function NetworksPanel() {
  const nets = useStore((x) => x.networks);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <Card className="p-6 space-y-3">
      <h3 className="font-bold">العملات والشبكات (إيداع/سحب)</h3>
      {nets.map((n) => (
        <div key={n.id} className="grid md:grid-cols-8 gap-2 items-end border rounded-lg p-3">
          <div><Label>العملة</Label><Input value={n.coin} onChange={(e) => upd("networks", n.id, { coin: e.target.value })} dir="ltr" /></div>
          <div><Label>الشبكة</Label><Input value={n.network} onChange={(e) => upd("networks", n.id, { network: e.target.value })} dir="ltr" /></div>
          <div className="md:col-span-2"><Label>عنوان المحفظة</Label><Input value={n.address} onChange={(e) => upd("networks", n.id, { address: e.target.value })} dir="ltr" /></div>
          <div><Label>الحد الأدنى</Label><Input type="number" value={n.minDeposit} onChange={(e) => upd("networks", n.id, { minDeposit: +e.target.value })} dir="ltr" /></div>
          <div><Label>الحد الأقصى</Label><Input type="number" value={n.maxDeposit} onChange={(e) => upd("networks", n.id, { maxDeposit: +e.target.value })} dir="ltr" /></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><Switch checked={n.enabled} onCheckedChange={(v) => upd("networks", n.id, { enabled: v })} /><span className="text-xs">إيداع</span></div>
            <div className="flex items-center gap-2"><Switch checked={n.forWithdraw} onCheckedChange={(v) => upd("networks", n.id, { forWithdraw: v })} /><span className="text-xs">سحب</span></div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => rm("networks", n.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ))}
      <Button variant="outline" onClick={() => add("networks", { coin: "USDT", network: "TRC20", address: "", minDeposit: 10, maxDeposit: 100000, fee: 0, feeType: "fixed", enabled: true, forWithdraw: true })}>
        <Plus className="w-4 h-4 ml-1" />إضافة شبكة
      </Button>
    </Card>
  );
}

function FinancePanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  const providers = useStore((x) => x.paymentProviders);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">إعدادات الإيداع والسحب</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>موافقة تلقائية تحت ($)</Label><Input type="number" value={s.autoApproveDepositUnder} onChange={(e) => update({ autoApproveDepositUnder: +e.target.value })} dir="ltr" /></div>
          <div><Label>الحد الأدنى للسحب</Label><Input type="number" value={s.withdrawMin} onChange={(e) => update({ withdrawMin: +e.target.value })} dir="ltr" /></div>
          <div><Label>رسوم السحب</Label><Input type="number" value={s.withdrawFee} onChange={(e) => update({ withdrawFee: +e.target.value })} dir="ltr" /></div>
          <div><Label>نوع الرسم</Label>
            <Select value={s.withdrawFeeType} onValueChange={(v: any) => update({ withdrawFeeType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="fixed">ثابت</SelectItem><SelectItem value="percent">نسبة %</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>يدفعه</Label>
            <Select value={s.withdrawFeeBy} onValueChange={(v: any) => update({ withdrawFeeBy: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="user">المستخدم</SelectItem><SelectItem value="company">الشركة</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2"><Switch checked={s.withdraw2FA} onCheckedChange={(v) => update({ withdraw2FA: v })} /><Label>2FA للسحب</Label></div>
          <div className="flex items-center gap-2"><Switch checked={s.showBonusInWithdrawable} onCheckedChange={(v) => update({ showBonusInWithdrawable: v })} /><Label>احتساب المكافآت ضمن المتاح</Label></div>
          <div className="flex items-center gap-2"><Switch checked={s.multiLevelApprovals} onCheckedChange={(v) => update({ multiLevelApprovals: v })} /><Label>موافقات متعددة المستويات</Label></div>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h3 className="font-bold">مزودو الدفع</h3>
        {providers.map((p) => (
          <div key={p.id} className="grid md:grid-cols-5 gap-2 items-end border rounded-lg p-3">
            <div><Label>الاسم</Label><Input value={p.name} onChange={(e) => upd("paymentProviders", p.id, { name: e.target.value })} /></div>
            <div><Label>النوع</Label><Input value={p.type} onChange={(e) => upd("paymentProviders", p.id, { type: e.target.value })} dir="ltr" /></div>
            <div><Label>الدول</Label><Input value={p.countries} onChange={(e) => upd("paymentProviders", p.id, { countries: e.target.value })} dir="ltr" /></div>
            <div className="flex items-center gap-2"><Switch checked={p.enabled} onCheckedChange={(v) => upd("paymentProviders", p.id, { enabled: v })} /><Label className="text-xs">مفعّل</Label></div>
            <Button variant="ghost" size="icon" onClick={() => rm("paymentProviders", p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => add("paymentProviders", { name: "مزود جديد", type: "wallet", enabled: false, countries: "ALL" })}>
          <Plus className="w-4 h-4 ml-1" />إضافة مزود
        </Button>
      </Card>
    </div>
  );
}

function ReferralPanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold">إعدادات الإحالة</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div><Label>L1 %</Label><Input type="number" value={s.referralL1} onChange={(e) => update({ referralL1: +e.target.value })} dir="ltr" /></div>
        <div><Label>L2 %</Label><Input type="number" value={s.referralL2} onChange={(e) => update({ referralL2: +e.target.value })} dir="ltr" /></div>
        <div><Label>L3 %</Label><Input type="number" value={s.referralL3} onChange={(e) => update({ referralL3: +e.target.value })} dir="ltr" /></div>
        <div className="md:col-span-3"><Label>قالب الرابط (استخدم {"{code}"})</Label><Input value={s.referralLinkPattern} onChange={(e) => update({ referralLinkPattern: e.target.value })} dir="ltr" /></div>
        <div className="flex items-center gap-2"><Switch checked={s.referralEnabled} onCheckedChange={(v) => update({ referralEnabled: v })} /><Label>تفعيل البرنامج</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.referralReportsEnabled} onCheckedChange={(v) => update({ referralReportsEnabled: v })} /><Label>تقارير دورية</Label></div>
      </div>
    </Card>
  );
}

function BonusPanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  const tiers = useStore((x) => x.bonusTiers);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">إعدادات المكافآت</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>قيمة المكافأة ($)</Label><Input type="number" step="0.1" value={s.dailyBonus} onChange={(e) => update({ dailyBonus: +e.target.value })} dir="ltr" /></div>
          <div><Label>التكرار</Label>
            <Select value={s.bonusFrequency} onValueChange={(v: any) => update({ bonusFrequency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="daily">يومي</SelectItem><SelectItem value="weekly">أسبوعي</SelectItem><SelectItem value="monthly">شهري</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>عدد إحالات مطلوبة</Label><Input type="number" value={s.bonusRequireRefs} onChange={(e) => update({ bonusRequireRefs: +e.target.value })} dir="ltr" /></div>
          <div className="flex items-center gap-2"><Switch checked={s.bonusRequireKYC} onCheckedChange={(v) => update({ bonusRequireKYC: v })} /><Label>اشتراط KYC</Label></div>
        </div>
      </Card>
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">مستويات المكافآت</h3>
        {tiers.map((t) => (
          <div key={t.id} className="grid md:grid-cols-4 gap-2 items-end border rounded-lg p-3">
            <div><Label>الاسم</Label><Input value={t.name} onChange={(e) => upd("bonusTiers", t.id, { name: e.target.value })} /></div>
            <div><Label>الحد الأدنى للرصيد</Label><Input type="number" value={t.minBalance} onChange={(e) => upd("bonusTiers", t.id, { minBalance: +e.target.value })} dir="ltr" /></div>
            <div><Label>قيمة المكافأة</Label><Input type="number" value={t.bonus} onChange={(e) => upd("bonusTiers", t.id, { bonus: +e.target.value })} dir="ltr" /></div>
            <Button variant="ghost" size="icon" onClick={() => rm("bonusTiers", t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => add("bonusTiers", { name: "مستوى", minBalance: 0, bonus: 1 })}><Plus className="w-4 h-4 ml-1" />إضافة مستوى</Button>
      </Card>
    </div>
  );
}

function TradePanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold">إعدادات التداول</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div><Label>نوع الرسم الافتراضي</Label>
          <Select value={s.defaultChartType} onValueChange={(v: any) => update({ defaultChartType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="line">خط</SelectItem><SelectItem value="candle">شموع</SelectItem><SelectItem value="bar">عمود</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2"><Switch checked={s.allowChartChange} onCheckedChange={(v) => update({ allowChartChange: v })} /><Label>السماح بالتغيير</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.showFibonacci} onCheckedChange={(v) => update({ showFibonacci: v })} /><Label>فيبوناتشي</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.showMA} onCheckedChange={(v) => update({ showMA: v })} /><Label>المتوسطات المتحركة</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.showRSI} onCheckedChange={(v) => update({ showRSI: v })} /><Label>RSI</Label></div>
        <div className="flex items-center gap-2"><Switch checked={s.showAINews} onCheckedChange={(v) => update({ showAINews: v })} /><Label>لوحة AI/أخبار</Label></div>
      </div>
    </Card>
  );
}

function BalancePanel() {
  const s = useStore((x) => x.settings);
  const update = useStore((x) => x.updateSettings);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold">إعدادات الرصيد والأرباح</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div><Label>أدنى ربح %</Label><Input type="number" value={s.profitMin} onChange={(e) => update({ profitMin: +e.target.value })} dir="ltr" /></div>
        <div><Label>أقصى ربح %</Label><Input type="number" value={s.profitMax} onChange={(e) => update({ profitMax: +e.target.value })} dir="ltr" /></div>
        <div><Label>تكرار الأرباح</Label>
          <Select value={s.profitFrequency} onValueChange={(v: any) => update({ profitFrequency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="daily">يومي</SelectItem><SelectItem value="weekly">أسبوعي</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>وضع الاحتساب</Label>
          <Select value={s.profitMode} onValueChange={(v: any) => update({ profitMode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="fixed">ثابت</SelectItem><SelectItem value="tiered">حسب المستويات</SelectItem><SelectItem value="market">حسب السوق</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>مدة السجل (أيام)</Label><Input type="number" value={s.historyDays} onChange={(e) => update({ historyDays: +e.target.value })} dir="ltr" /></div>
        <div className="flex items-center gap-2"><Switch checked={s.allowCurrencyToggle} onCheckedChange={(v) => update({ allowCurrencyToggle: v })} /><Label>تبديل العملة المعروضة</Label></div>
      </div>
    </Card>
  );
}

function RolesPanel() {
  const roles = useStore((x) => x.roles);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  const allPerms = ["read", "create", "update", "delete", "approve", "export"];
  return (
    <Card className="p-6 space-y-3">
      <h3 className="font-bold">الأدوار والصلاحيات</h3>
      {roles.map((r) => (
        <div key={r.id} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input value={r.name} onChange={(e) => upd("roles", r.id, { name: e.target.value })} className="max-w-xs" />
            <Button variant="ghost" size="icon" onClick={() => rm("roles", r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPerms.map((p) => {
              const has = r.perms.includes(p);
              return (
                <Badge
                  key={p}
                  variant={has ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => upd("roles", r.id, { perms: has ? r.perms.filter((x) => x !== p) : [...r.perms, p] })}
                >{p}</Badge>
              );
            })}
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={() => add("roles", { name: "دور جديد", perms: ["read"] })}><Plus className="w-4 h-4 ml-1" />إضافة دور</Button>
    </Card>
  );
}

function ContentPanel() {
  const articles = useStore((x) => x.articles);
  const faqs = useStore((x) => x.faqs);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">المقالات والإعلانات</h3>
        {articles.map((a) => (
          <div key={a.id} className="border rounded-lg p-3 space-y-2">
            <Input value={a.title} onChange={(e) => upd("articles", a.id, { title: e.target.value })} />
            <Textarea rows={3} value={a.body} onChange={(e) => upd("articles", a.id, { body: e.target.value })} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Switch checked={a.pinned} onCheckedChange={(v) => upd("articles", a.id, { pinned: v })} /><Label>تثبيت</Label></div>
              <Button variant="ghost" size="icon" onClick={() => rm("articles", a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={() => add("articles", { title: "مقالة جديدة", body: "...", pinned: false, createdAt: Date.now() })}><Plus className="w-4 h-4 ml-1" />إضافة مقالة</Button>
      </Card>

      <Card className="p-6 space-y-3">
        <h3 className="font-bold">الأسئلة الشائعة</h3>
        {faqs.map((f) => (
          <div key={f.id} className="border rounded-lg p-3 space-y-2">
            <Input value={f.q} onChange={(e) => upd("faqs", f.id, { q: e.target.value })} />
            <Textarea rows={2} value={f.a} onChange={(e) => upd("faqs", f.id, { a: e.target.value })} />
            <Button variant="ghost" size="icon" onClick={() => rm("faqs", f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => add("faqs", { q: "سؤال جديد", a: "إجابة..." })}><Plus className="w-4 h-4 ml-1" />إضافة سؤال</Button>
      </Card>
    </div>
  );
}

function LanguagesPanel() {
  const langs = useStore((x) => x.languages);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <Card className="p-6 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Globe className="w-5 h-5" />اللغات</h3>
      {langs.map((l) => (
        <div key={l.id} className="grid md:grid-cols-4 gap-2 items-end border rounded-lg p-3">
          <div><Label>الكود</Label><Input value={l.code} onChange={(e) => upd("languages", l.id, { code: e.target.value })} dir="ltr" /></div>
          <div><Label>الاسم</Label><Input value={l.name} onChange={(e) => upd("languages", l.id, { name: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Switch checked={l.enabled} onCheckedChange={(v) => upd("languages", l.id, { enabled: v })} /><Label>مفعّلة</Label></div>
          <Button variant="ghost" size="icon" onClick={() => rm("languages", l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ))}
      <Button variant="outline" onClick={() => add("languages", { code: "xx", name: "لغة جديدة", enabled: false })}><Plus className="w-4 h-4 ml-1" />إضافة لغة</Button>
    </Card>
  );
}

function AIPanel() {
  const algos = useStore((x) => x.aiAlgos);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  return (
    <Card className="p-6 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><Brain className="w-5 h-5" />خوارزميات الذكاء الاصطناعي</h3>
      {algos.map((a) => (
        <div key={a.id} className="grid md:grid-cols-5 gap-2 items-end border rounded-lg p-3">
          <div className="md:col-span-2"><Label>الاسم</Label><Input value={a.name} onChange={(e) => upd("aiAlgos", a.id, { name: e.target.value })} /></div>
          <div><Label>الوزن ({a.weight})</Label><Slider min={0} max={100} step={5} value={[a.weight]} onValueChange={(v) => upd("aiAlgos", a.id, { weight: v[0] })} className="mt-3" /></div>
          <div className="flex items-center gap-2"><Switch checked={a.enabled} onCheckedChange={(v) => upd("aiAlgos", a.id, { enabled: v })} /><Label>مفعّلة</Label></div>
          <Button variant="ghost" size="icon" onClick={() => rm("aiAlgos", a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ))}
      <Button variant="outline" onClick={() => add("aiAlgos", { name: "خوارزمية جديدة", weight: 10, enabled: true })}><Plus className="w-4 h-4 ml-1" />إضافة</Button>
      <div className="border-t pt-3 mt-3">
        <Button variant="outline" onClick={() => toast.success("تم بدء تدريب النموذج (Mock)")}>تدريب النموذج الآن</Button>
      </div>
    </Card>
  );
}

function LogsPanel() {
  const logs = useStore((x) => x.activityLogs);
  return (
    <Card className="p-6">
      <h3 className="font-bold mb-3">سجل النشاط</h3>
      {logs.length === 0 && <p className="text-muted-foreground text-sm">لا توجد سجلات بعد. الإجراءات الإدارية ستظهر هنا.</p>}
      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {logs.map((l) => (
          <div key={l.id} className="border rounded-lg p-2 text-sm flex justify-between">
            <span><b dir="ltr">{l.actor}</b> — {l.action}</span>
            <span className="text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString("ar-EG")}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PageBuilderPanel() {
  const tpls = useStore((x) => x.pageTemplates);
  const upd = useStore((x) => x.updateItem);
  const add = useStore((x) => x.addItem);
  const rm = useStore((x) => x.removeItem);
  const [blocks, setBlocks] = useState<{ id: string; type: string; text: string }[]>([
    { id: "1", type: "heading", text: "عنوان رئيسي" },
    { id: "2", type: "paragraph", text: "نص توضيحي للصفحة الجديدة" },
    { id: "3", type: "button", text: "زر إجراء" },
  ]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">قوالب الصفحات</h3>
        {tpls.map((t) => (
          <div key={t.id} className="grid md:grid-cols-4 gap-2 items-end border rounded-lg p-3">
            <Input value={t.name} onChange={(e) => upd("pageTemplates", t.id, { name: e.target.value })} />
            <Select value={t.layout} onValueChange={(v) => upd("pageTemplates", t.id, { layout: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["grid-1", "grid-2", "grid-3", "single"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2"><Switch checked={t.active} onCheckedChange={(v) => upd("pageTemplates", t.id, { active: v })} /><Label>نشط</Label></div>
            <Button variant="ghost" size="icon" onClick={() => rm("pageTemplates", t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => add("pageTemplates", { name: "قالب", layout: "grid-2", active: false })}><Plus className="w-4 h-4 ml-1" />إضافة قالب</Button>
      </Card>

      <Card className="p-6 space-y-3">
        <h3 className="font-bold">منشئ صفحات (سحب وإسقاط — Mock)</h3>
        <div className="space-y-2">
          {blocks.map((b, i) => (
            <div key={b.id} className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <Badge>{b.type}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { if (i > 0) { const a = [...blocks];[a[i - 1], a[i]] = [a[i], a[i - 1]]; setBlocks(a); } }}>↑</Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (i < blocks.length - 1) { const a = [...blocks];[a[i + 1], a[i]] = [a[i], a[i + 1]]; setBlocks(a); } }}>↓</Button>
                  <Button size="sm" variant="ghost" onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <Input value={b.text} onChange={(e) => setBlocks(blocks.map((x) => x.id === b.id ? { ...x, text: e.target.value } : x))} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {["heading", "paragraph", "button", "image", "table", "chart"].map((t) => (
            <Button key={t} size="sm" variant="outline" onClick={() => setBlocks([...blocks, { id: Math.random().toString(36).slice(2), type: t, text: t }])}>
              <Plus className="w-3 h-3 ml-1" />{t}
            </Button>
          ))}
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("تم حفظ تصميم الصفحة")}>حفظ التصميم</Button>
      </Card>
    </div>
  );
}
