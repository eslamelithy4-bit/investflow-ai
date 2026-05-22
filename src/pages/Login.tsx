import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const settings = useStore((s) => s.settings);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(form.email, form.password);
    if (!res.ok) return toast.error(settings.loginErrorMsg || res.error);
    toast.success("مرحباً بعودتك");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-3">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-gradient">{settings.brandName}</h1>
          <p className="text-muted-foreground mt-1">سجّل دخولك إلى حسابك</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
          </div>
          <div>
            <Label>كلمة المرور</Label>
            <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} dir="ltr" />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11 text-base font-bold">تسجيل الدخول</Button>
          {settings.forgotPasswordEnabled && (
            <p className="text-center text-sm">
              <Link to="/forgot-password" className="text-primary">نسيت كلمة المرور؟</Link>
            </p>
          )}
          {(settings.socialLogin.google || settings.socialLogin.facebook || settings.socialLogin.apple) && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                <div className="relative text-center text-xs"><span className="bg-card px-2 text-muted-foreground">أو</span></div>
              </div>
              <div className="grid gap-2">
                {settings.socialLogin.google && <Button type="button" variant="outline" onClick={() => toast.info("Google login (Mock)")}>الدخول عبر Google</Button>}
                {settings.socialLogin.facebook && <Button type="button" variant="outline" onClick={() => toast.info("Facebook login (Mock)")}>الدخول عبر Facebook</Button>}
                {settings.socialLogin.apple && <Button type="button" variant="outline" onClick={() => toast.info("Apple login (Mock)")}>الدخول عبر Apple</Button>}
              </div>
            </>
          )}
          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟ <Link to="/signup" className="text-primary font-bold">سجّل الآن</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
