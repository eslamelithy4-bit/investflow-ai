import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Users } from "lucide-react";
import { toast } from "sonner";

export default function Referral() {
  const user = useStore((s) => s.currentUser())!;
  const { referralL1, referralL2, referralL3 } = useStore((s) => s.settings);
  const users = useStore((s) => s.users);
  const link = `${window.location.origin}/signup?ref=${user.referralCode}`;

  const myReferrals = users.filter((u) => u.referredBy === user.id);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6 shadow-elegant gradient-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Share2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">رابط الإحالة الخاص بك</h3>
              <p className="text-sm text-muted-foreground">شارك الرابط واحصل على عمولات على 3 مستويات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input readOnly value={link} dir="ltr" className="font-mono text-sm" />
            <Button onClick={() => { navigator.clipboard.writeText(link); toast.success("تم النسخ"); }}>
              <Copy className="w-4 h-4 ml-2" />نسخ
            </Button>
          </div>
          <div className="mt-3 text-sm">
            كود الإحالة: <code className="bg-muted px-2 py-1 rounded font-bold text-primary">{user.referralCode}</code>
          </div>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { lvl: 1, pct: referralL1, color: "from-emerald-500 to-teal-500" },
            { lvl: 2, pct: referralL2, color: "from-blue-500 to-cyan-500" },
            { lvl: 3, pct: referralL3, color: "from-violet-500 to-purple-500" },
          ].map((l) => (
            <Card key={l.lvl} className="p-5 shadow-card text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center mb-3`}>
                <span className="text-white font-black text-lg">L{l.lvl}</span>
              </div>
              <div className="text-3xl font-black text-gradient">{l.pct}%</div>
              <div className="text-sm text-muted-foreground mt-1">من إيداعات المستوى {l.lvl}</div>
            </Card>
          ))}
        </div>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold">إحالاتك المباشرة ({myReferrals.length})</h3>
          </div>
          {myReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد إحالات بعد. ابدأ بمشاركة رابطك!</p>
          ) : (
            <div className="space-y-2">
              {myReferrals.map((r) => (
                <div key={r.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm" dir="ltr">{r.email}</span>
                  <span className="text-xs text-muted-foreground">إيداع: ${r.depositTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
