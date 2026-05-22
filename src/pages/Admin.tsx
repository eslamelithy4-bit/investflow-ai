import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users, ArrowDownToLine, ArrowUpFromLine, Settings, BarChart3, Bell, Trash2, Edit, Download,
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const me = useStore((s) => s.currentUser());
  if (!me?.isAdmin) { navigate("/dashboard"); return null; }

  const users = useStore((s) => s.users);
  const transactions = useStore((s) => s.transactions);
  const notifications = useStore((s) => s.notifications);
  const settings = useStore((s) => s.settings);
  const approveTx = useStore((s) => s.approveTx);
  const rejectTx = useStore((s) => s.rejectTx);
  const updateUser = useStore((s) => s.updateUser);
  const deleteUser = useStore((s) => s.deleteUser);
  const updateSettings = useStore((s) => s.updateSettings);
  const clearNotifs = useStore((s) => s.clearNotifs);

  const deposits = transactions.filter((t) => t.type === "deposit");
  const withdraws = transactions.filter((t) => t.type === "withdraw");
  const totalDep = deposits.filter((t) => t.status === "approved").reduce((a, t) => a + t.amount, 0);
  const totalWd = withdraws.filter((t) => t.status === "approved").reduce((a, t) => a + t.amount, 0);
  const totalProfit = transactions.filter((t) => t.type === "profit").reduce((a, t) => a + t.amount, 0);
  const totalBonus = transactions.filter((t) => t.type === "bonus" || t.type === "referral").reduce((a, t) => a + t.amount, 0);

  const [search, setSearch] = useState("");
  const filteredUsers = users.filter((u) => u.email.includes(search) || u.phone.includes(search));

  const exportCSV = () => {
    const rows = [
      ["id", "userId", "type", "amount", "status", "createdAt"],
      ...transactions.map((t) => [t.id, t.userId, t.type, t.amount, t.status, new Date(t.createdAt).toISOString()]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
  };

  const userEmail = (id: string) => users.find((u) => u.id === id)?.email || "—";

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الإيداعات", value: `$${totalDep.toFixed(2)}`, color: "from-emerald-500 to-teal-500", icon: ArrowDownToLine },
            { label: "إجمالي السحوبات", value: `$${totalWd.toFixed(2)}`, color: "from-rose-500 to-orange-500", icon: ArrowUpFromLine },
            { label: "أرباح موزعة", value: `$${totalProfit.toFixed(2)}`, color: "from-blue-500 to-cyan-500", icon: BarChart3 },
            { label: "مكافآت موزعة", value: `$${totalBonus.toFixed(2)}`, color: "from-amber-500 to-yellow-500", icon: Users },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-5 shadow-card">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-black mt-1">{s.value}</div>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="deposits">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="deposits"><ArrowDownToLine className="w-4 h-4 ml-1" />الإيداعات</TabsTrigger>
            <TabsTrigger value="withdraws"><ArrowUpFromLine className="w-4 h-4 ml-1" />السحوبات</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 ml-1" />المستخدمون</TabsTrigger>
            <TabsTrigger value="notifs"><Bell className="w-4 h-4 ml-1" />الإشعارات</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 ml-1" />الإعدادات</TabsTrigger>
            <TabsTrigger value="reports"><Download className="w-4 h-4 ml-1" />التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits">
            <Card className="p-5">
              <h3 className="font-bold mb-3">طلبات الإيداع</h3>
              <div className="space-y-2">
                {deposits.length === 0 && <p className="text-muted-foreground text-sm">لا توجد طلبات</p>}
                {deposits.map((t) => (
                  <div key={t.id} className="border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-bold">{userEmail(t.userId)}</div>
                      <div className="text-xs text-muted-foreground">{t.network} • {new Date(t.createdAt).toLocaleString("ar-EG")}</div>
                    </div>
                    <div className="font-black text-lg" dir="ltr">${t.amount}</div>
                    {t.proofImage && (
                      <Dialog>
                        <DialogTrigger asChild><Button variant="outline" size="sm">عرض الإثبات</Button></DialogTrigger>
                        <DialogContent><img src={t.proofImage} alt="proof" className="w-full rounded" /></DialogContent>
                      </Dialog>
                    )}
                    <Badge variant={t.status === "pending" ? "secondary" : t.status === "approved" ? "default" : "destructive"} className={t.status === "approved" ? "bg-success" : ""}>
                      {t.status}
                    </Badge>
                    {t.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { const a = prompt("تأكيد المبلغ", String(t.amount)); if (a) approveTx(t.id, parseFloat(a)); toast.success("تمت الموافقة"); }}>قبول</Button>
                        <Button size="sm" variant="destructive" onClick={() => { rejectTx(t.id); toast.error("تم الرفض"); }}>رفض</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="withdraws">
            <Card className="p-5">
              <h3 className="font-bold mb-3">طلبات السحب</h3>
              <div className="space-y-2">
                {withdraws.length === 0 && <p className="text-muted-foreground text-sm">لا توجد طلبات</p>}
                {withdraws.map((t) => (
                  <div key={t.id} className="border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-bold">{userEmail(t.userId)}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{t.address}</div>
                      <div className="text-xs text-muted-foreground">{t.network} • {new Date(t.createdAt).toLocaleString("ar-EG")}</div>
                    </div>
                    <div className="font-black text-lg" dir="ltr">${t.amount}</div>
                    <Badge variant={t.status === "pending" ? "secondary" : t.status === "approved" ? "default" : "destructive"} className={t.status === "approved" ? "bg-success" : ""}>{t.status}</Badge>
                    {t.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { const a = prompt("تأكيد المبلغ", String(t.amount)); if (a) approveTx(t.id, parseFloat(a)); toast.success("تمت الموافقة"); }}>قبول</Button>
                        <Button size="sm" variant="destructive" onClick={() => { rejectTx(t.id); toast.error("تم الرفض"); }}>رفض</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                <h3 className="font-bold">المستخدمون ({users.length})</h3>
                <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr><th className="text-right p-2">البريد</th><th className="text-right p-2">الهاتف</th><th className="text-right p-2">الرصيد</th><th className="text-right p-2">الحالة</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50">
                        <td className="p-2" dir="ltr">{u.email} {u.isAdmin && <Badge variant="default" className="mr-1">Admin</Badge>}</td>
                        <td className="p-2" dir="ltr">{u.phone}</td>
                        <td className="p-2 font-bold" dir="ltr">${u.balance.toFixed(2)}</td>
                        <td className="p-2">{u.active ? <Badge className="bg-success">نشط</Badge> : <Badge variant="secondary">معطل</Badge>}</td>
                        <td className="p-2 flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild><Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>تعديل المستخدم</DialogTitle></DialogHeader>
                              <EditUser id={u.id} />
                            </DialogContent>
                          </Dialog>
                          {!u.isAdmin && (
                            <Button size="icon" variant="ghost" onClick={() => { if (confirm("حذف؟")) { deleteUser(u.id); toast.success("تم الحذف"); } }}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifs">
            <Card className="p-5">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold">الإشعارات</h3>
                <Button variant="outline" size="sm" onClick={clearNotifs}>مسح الكل</Button>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 && <p className="text-muted-foreground text-sm">لا توجد إشعارات</p>}
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 border rounded-lg">
                    <div className="text-sm">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString("ar-EG")}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-5">
              <h3 className="font-bold mb-4">إعدادات النظام</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>اسم المنصة</Label>
                  <Input value={settings.brandName} onChange={(e) => updateSettings({ brandName: e.target.value })} />
                </div>
                <div>
                  <Label>عنوان محفظة الإيداع</Label>
                  <Input value={settings.walletAddress} onChange={(e) => updateSettings({ walletAddress: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>قيمة المكافأة اليومية ($)</Label>
                  <Input type="number" step="0.1" value={settings.dailyBonus} onChange={(e) => updateSettings({ dailyBonus: parseFloat(e.target.value) })} dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>أدنى ربح %</Label><Input type="number" value={settings.profitMin} onChange={(e) => updateSettings({ profitMin: parseFloat(e.target.value) })} /></div>
                  <div><Label>أقصى ربح %</Label><Input type="number" value={settings.profitMax} onChange={(e) => updateSettings({ profitMax: parseFloat(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                  <div><Label>إحالة L1 %</Label><Input type="number" value={settings.referralL1} onChange={(e) => updateSettings({ referralL1: parseFloat(e.target.value) })} /></div>
                  <div><Label>إحالة L2 %</Label><Input type="number" value={settings.referralL2} onChange={(e) => updateSettings({ referralL2: parseFloat(e.target.value) })} /></div>
                  <div><Label>إحالة L3 %</Label><Input type="number" value={settings.referralL3} onChange={(e) => updateSettings({ referralL3: parseFloat(e.target.value) })} /></div>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Switch checked={settings.referralEnabled} onCheckedChange={(v) => updateSettings({ referralEnabled: v })} />
                  <Label>تفعيل برنامج الإحالة</Label>
                </div>
                <div className="md:col-span-2">
                  <Label>عنوان المقدمة</Label>
                  <Input value={settings.introTitle} onChange={(e) => updateSettings({ introTitle: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>نص المقدمة</Label>
                  <Textarea rows={3} value={settings.introText} onChange={(e) => updateSettings({ introText: e.target.value })} />
                </div>
              </div>
              <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => toast.success("تم الحفظ")}>حفظ التغييرات</Button>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-5">
              <h3 className="font-bold mb-4">التقارير والسجلات</h3>
              <Button onClick={exportCSV} className="gradient-primary text-primary-foreground"><Download className="w-4 h-4 ml-2" />تصدير CSV</Button>
              <div className="mt-4 max-h-96 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground"><tr><th className="text-right p-2">المستخدم</th><th className="text-right p-2">النوع</th><th className="text-right p-2">المبلغ</th><th className="text-right p-2">الحالة</th><th className="text-right p-2">الوقت</th></tr></thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b">
                        <td className="p-2" dir="ltr">{userEmail(t.userId)}</td>
                        <td className="p-2">{t.type}</td>
                        <td className="p-2" dir="ltr">${t.amount}</td>
                        <td className="p-2">{t.status}</td>
                        <td className="p-2">{new Date(t.createdAt).toLocaleString("ar-EG")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function EditUser({ id }: { id: string }) {
  const u = useStore((s) => s.users.find((x) => x.id === id))!;
  const updateUser = useStore((s) => s.updateUser);
  const [form, setForm] = useState({ email: u.email, phone: u.phone, balance: u.balance, active: u.active });
  return (
    <div className="space-y-3">
      <div><Label>البريد</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
      <div><Label>الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
      <div><Label>الرصيد</Label><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) })} dir="ltr" /></div>
      <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>نشط</Label></div>
      <Button className="w-full gradient-primary text-primary-foreground" onClick={() => { updateUser(id, form); toast.success("تم التحديث"); }}>حفظ</Button>
    </div>
  );
}
