import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Upload, CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";

export default function Deposit() {
  const wallet = useStore((s) => s.settings.walletAddress);
  const requestDeposit = useStore((s) => s.requestDeposit);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("USDT-TRC20");
  const [proof, setProof] = useState<string | undefined>();
  const [step, setStep] = useState(1);

  const copy = () => { navigator.clipboard.writeText(wallet); toast.success("تم نسخ العنوان"); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setProof(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!proof) return toast.error("يرجى رفع صورة إثبات الإيداع");
    requestDeposit(parseFloat(amount), network, proof);
    toast.success("تم إرسال الطلب للإدارة للمراجعة");
    setAmount(""); setProof(undefined); setStep(1);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {step === 1 && (
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-bold mb-4">تفاصيل الإيداع</h3>
            <div className="space-y-4">
              <div>
                <Label>قيمة الإيداع (USD)</Label>
                <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" placeholder="100" />
              </div>
              <div>
                <Label>اختر الشبكة</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT-TRC20">USDT — TRC20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setStep(2)}
                className="w-full gradient-primary text-primary-foreground h-11 font-bold"
              >
                متابعة
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 shadow-elegant">
            <h3 className="text-xl font-bold mb-2">حوّل المبلغ إلى العنوان التالي</h3>
            <p className="text-sm text-muted-foreground mb-4">
              المبلغ: <strong className="text-foreground">${amount}</strong> — الشبكة: <strong className="text-foreground">{network}</strong>
            </p>
            <div className="bg-muted rounded-xl p-6 flex flex-col items-center gap-4">
              <div className="bg-white p-3 rounded-xl border-2 border-dashed border-primary/30">
                <img
                  alt="QR Code"
                  className="w-44 h-44"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wallet)}`}
                />
              </div>
              <div className="w-full">
                <Label className="text-xs">عنوان المحفظة</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-background border rounded-lg px-3 py-2 text-xs break-all" dir="ltr">{wallet}</code>
                  <Button size="icon" variant="outline" onClick={copy}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label>صورة إثبات الإيداع</Label>
              <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-muted transition-smooth">
                {proof ? (
                  <>
                    <img src={proof} alt="proof" className="max-h-40 rounded-lg" />
                    <span className="mt-2 text-sm text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />تم الرفع</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mt-2">اضغط لرفع صورة</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">رجوع</Button>
              <Button onClick={submit} className="flex-1 gradient-primary text-primary-foreground font-bold">إرسال الطلب</Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
