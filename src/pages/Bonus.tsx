import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Bonus() {
  const claim = useStore((s) => s.claimDailyBonus);
  const claimProfit = useStore((s) => s.claimDailyProfit);
  const user = useStore((s) => s.currentUser())!;
  const dailyBonus = useStore((s) => s.settings.dailyBonus);

  const lastClaim = user.lastBonusClaim || 0;
  const ready = Date.now() - lastClaim >= 24 * 60 * 60 * 1000;
  const todayProfit = user.lastProfitDate === new Date().toDateString();

  const handleBonus = () => { const r = claim(); r.ok ? toast.success(`+ $${dailyBonus} للرصيد`) : toast.error(r.error); };
  const handleProfit = () => { const r = claimProfit(); r.ok ? toast.success("تم احتساب أرباح اليوم") : toast.error(r.error); };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-8 shadow-elegant text-center gradient-card">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-4 shadow-glow">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black">المكافأة اليومية</h3>
          <p className="text-muted-foreground mt-1">احصل على ${dailyBonus} يوميًا</p>
          <div className="text-5xl font-black text-gradient my-6">${dailyBonus}</div>
          <Button
            disabled={!ready}
            onClick={handleBonus}
            size="lg"
            className="gradient-primary text-primary-foreground font-bold px-8"
          >
            {ready ? "احصل على مكافأتك الآن" : "تم الاستلام — عد غدًا"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">إجمالي مكافآتك: ${user.bonusTotal.toFixed(2)}</p>
          {user.depositTotal <= 0 && (
            <p className="text-xs text-warning mt-2">⚠ السحب يتطلب إيداعًا أوليًا.</p>
          )}
        </Card>

        <Card className="p-8 shadow-elegant text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-success flex items-center justify-center mb-4 shadow-glow">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black">الأرباح اليومية الذكية</h3>
          <p className="text-muted-foreground mt-1">من 1% إلى 8% من رصيد إيداعاتك يوميًا</p>
          <div className="text-3xl font-black text-success my-6 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            ${user.profitTotal.toFixed(2)}
          </div>
          <Button
            disabled={todayProfit || user.depositTotal <= 0}
            onClick={handleProfit}
            size="lg"
            variant="outline"
            className="font-bold px-8"
          >
            {todayProfit ? "تم تحصيل ربح اليوم" : "احتسب ربح اليوم"}
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
