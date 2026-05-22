import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowDownToLine, Gift, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Balance() {
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser());
  const brand = useStore((s) => s.settings.brandName);

  if (!user) {
    return null;
  }

  const isInactive = user.depositTotal <= 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="overflow-hidden shadow-elegant border-0">
          <div className="gradient-hero p-8 text-primary-foreground text-center">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <div className="font-black text-xl">{brand}</div>
            <div className="text-sm opacity-80 mt-3">الرصيد الإجمالي</div>
            <div className="text-lg md:text-xl font-bold my-2">
              {isInactive ? "قم بالإيداع أولاً، أنت لا تزال غير نشط" : `$${user.balance.toFixed(2)}`}
            </div>
            {!isInactive && <div className="text-sm opacity-80">USD</div>}
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-muted-foreground"><ArrowDownToLine className="w-4 h-4" />💳 الإيداعات</div>
              <div className="font-black" dir="ltr">${user.depositTotal.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-muted-foreground"><Gift className="w-4 h-4" />🎁 المكافآت</div>
              <div className="font-black" dir="ltr">${user.bonusTotal.toFixed(2)}</div>
            </div>
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" />📈 أرباح اليوم</div>
              <div className="font-black" dir="ltr">${user.profitTotal.toFixed(2)}</div>
            </div>

            <div className="pt-4 border-t text-center text-sm text-muted-foreground space-y-2">
              <p>آخر تحديث: الآن</p>
              <p>قم بمشاهدة أرباحك ورصيد محفظتك</p>
            </div>

            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={() => {
                if (isInactive) {
                  toast.error("قم بتفعيل حسابك أولاً بالإيداع");
                  navigate("/deposit");
                  return;
                }
                toast.success("حسابك مفعل ويمكنك متابعة أرباحك");
              }}
            >
              مشاهدة الأرباح والرصيد
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
