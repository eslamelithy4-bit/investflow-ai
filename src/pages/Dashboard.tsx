import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import {
  ArrowDownToLine, ArrowUpFromLine, Users, Gift, LineChart, Wallet,
  Sparkles, TrendingUp,
} from "lucide-react";

const tiles = [
  { to: "/deposit", label: "الإيداع", icon: ArrowDownToLine, gradient: "from-emerald-500 to-teal-500" },
  { to: "/withdraw", label: "السحب", icon: ArrowUpFromLine, gradient: "from-rose-500 to-orange-500" },
  { to: "/referral", label: "رابط الإحالة", icon: Users, gradient: "from-violet-500 to-fuchsia-500" },
  { to: "/bonus", label: "المكافآت اليومية", icon: Gift, gradient: "from-amber-500 to-yellow-500" },
  { to: "/trade", label: "التداول", icon: LineChart, gradient: "from-blue-500 to-cyan-500" },
  { to: "/balance", label: "الرصيد", icon: Wallet, gradient: "from-indigo-500 to-purple-500" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { introTitle, introText } = useStore((s) => s.settings);
  const user = useStore((s) => s.currentUser())!;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-elegant">
          <div className="gradient-hero p-8 md:p-10 text-primary-foreground relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm opacity-90">مدعوم بالذكاء الاصطناعي</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">{introTitle}</h1>
              <p className="text-base md:text-lg opacity-95 max-w-3xl leading-relaxed">{introText}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-xs opacity-80">رصيدك الحالي</div>
                  <div className="font-black text-xl">${user.balance.toFixed(2)}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-xs opacity-80">إجمالي الإيداع</div>
                  <div className="font-black text-xl">${user.depositTotal.toFixed(2)}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-xs opacity-80">الأرباح المحققة</div>
                  <div className="font-black text-xl flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />${user.profitTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.to}
                onClick={() => navigate(t.to)}
                className="group bg-card border rounded-2xl p-6 shadow-card hover:shadow-elegant transition-smooth hover:-translate-y-1 text-right"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-smooth`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="font-bold text-lg">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-1">اضغط للفتح</div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
