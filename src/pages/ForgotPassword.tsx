import { Link } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("بريد غير صحيح");
    setSent(true);
    toast.success("تم إرسال رابط إعادة التعيين (Mock)");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl gradient-primary items-center justify-center shadow-glow mb-3">
            <KeyRound className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black">إعادة تعيين كلمة المرور</h1>
          <p className="text-muted-foreground text-sm">سنرسل لك رابطًا على بريدك</p>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-success">تحقق من بريدك الإلكتروني</p>
            <Link to="/login" className="text-primary font-bold">العودة لتسجيل الدخول</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">إرسال الرابط</Button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary">العودة</Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
