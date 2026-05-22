import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Withdraw() {
  const requestWithdraw = useStore((s) => s.requestWithdraw);
  const user = useStore((s) => s.currentUser())!;
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("USDT-TRC20");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestWithdraw(parseFloat(amount), network, address, note);
    if (!res.ok) return toast.error(res.error);
    toast.success("تم إرسال طلب السحب للإدارة");
    setAmount(""); setAddress(""); setNote("");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 shadow-elegant">
          <h3 className="text-xl font-bold mb-1">طلب سحب</h3>
          <p className="text-sm text-muted-foreground mb-6">رصيدك المتاح: <strong className="text-primary">${user.balance.toFixed(2)}</strong></p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>المبلغ (USD)</Label>
              <Input type="number" min="1" max={user.balance} required value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" />
            </div>
            <div>
              <Label>الشبكة</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT-TRC20">USDT — TRC20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>عنوان محفظتك</Label>
              <Input required value={address} onChange={(e) => setAddress(e.target.value)} dir="ltr" placeholder="T..." />
            </div>
            <div>
              <Label>ملاحظة / Tag (اختياري)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} dir="ltr" rows={2} />
            </div>
            {user.depositTotal <= 0 && (
              <div className="bg-warning/10 border border-warning/30 text-warning-foreground rounded-lg p-3 text-sm">
                ⚠ يجب تنفيذ إيداع أول قبل تفعيل السحب.
              </div>
            )}
            <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11 font-bold">سحب</Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
