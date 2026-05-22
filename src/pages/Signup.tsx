import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const signup = useStore((s) => s.signup);
  const settings = useStore((s) => s.settings);
  const fields = useStore((s) => s.signupFields).filter((f) => f.visible);
  const [values, setValues] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState("");
  const [referredBy, setReferredBy] = useState("");

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !values[f.key]) return toast.error(`${f.label} مطلوب`);
    }
    if (values.password && values.password.length < 6) return toast.error("كلمة المرور قصيرة (6 أحرف على الأقل)");
    if (values.password && values.password !== confirm) return toast.error("كلمتا المرور غير متطابقتين");
    if (values.email && !/\S+@\S+\.\S+/.test(values.email)) return toast.error("البريد غير صحيح");
    const res = signup({
      email: values.email || "",
      phone: values.phone || "",
      password: values.password || "",
      referredBy: referredBy || undefined,
    });
    if (!res.ok) return toast.error(res.error);
    toast.success(settings.signupSuccessMsg);
    navigate(settings.autoLoginAfterSignup ? "/dashboard" : "/login");
  };

  const bgStyle: React.CSSProperties = settings.signupBgUrl
    ? { backgroundImage: `url(${settings.signupBgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" style={bgStyle}>
      {settings.signupBgVideoUrl && (
        <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover -z-10" src={settings.signupBgVideoUrl} />
      )}
      <Card className="w-full max-w-md p-8 shadow-elegant relative z-10 backdrop-blur bg-card/95">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-3">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-gradient">{settings.brandName}</h1>
          <p className="text-muted-foreground mt-1">أنشئ حسابك للبدء بالاستثمار الذكي</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.id}>
              <Label>{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
              {f.type === "select" ? (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  required={f.required}
                >
                  <option value="">اختر...</option>
                  {(f.options || "").split(",").map((o) => <option key={o} value={o.trim()}>{o.trim()}</option>)}
                </select>
              ) : (
                <Input
                  type={f.type}
                  required={f.required}
                  value={values[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  dir={f.type === "password" || f.type === "email" || f.type === "tel" ? "ltr" : undefined}
                />
              )}
              {f.helper && <p className="text-xs text-muted-foreground mt-1">{f.helper}</p>}
            </div>
          ))}
          {fields.some((f) => f.key === "password") && (
            <div>
              <Label>تأكيد كلمة المرور</Label>
              <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} dir="ltr" />
            </div>
          )}
          <div>
            <Label>كود الإحالة (اختياري)</Label>
            <Input value={referredBy} onChange={(e) => setReferredBy(e.target.value.toUpperCase())} dir="ltr" />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11 text-base font-bold">تسجيل</Button>
          <p className="text-center text-sm text-muted-foreground">
            لديك حساب؟ <Link to="/login" className="text-primary font-bold">تسجيل الدخول</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
