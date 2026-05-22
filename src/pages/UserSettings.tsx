import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function UserSettings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const languages = useStore((s) => s.languages);
  const currentLang = useStore((s) => s.currentLang);
  const setLang = useStore((s) => s.setLang);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6 space-y-4">
          <h1 className="text-2xl font-black">إعدادات الحساب</h1>
          {settings.allowThemeToggle && (
            <div className="flex items-center justify-between">
              <Label>الوضع الداكن</Label>
              <Switch
                checked={settings.themeMode === "dark"}
                onCheckedChange={(v) => { updateSettings({ themeMode: v ? "dark" : "light" }); toast.success("تم التحديث"); }}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>اللغة</Label>
            <Select value={currentLang} onValueChange={(v) => { setLang(v); toast.success("تم تغيير اللغة"); }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {languages.filter((l) => l.enabled).map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {settings.allowCurrencyToggle && (
            <div className="flex items-center justify-between">
              <Label>عرض العملة</Label>
              <Select defaultValue="USD">
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>المصادقة الثنائية (2FA)</Label>
            <Switch checked={settings.twoFAEnabled} onCheckedChange={(v) => { updateSettings({ twoFAEnabled: v }); toast.success("تم التحديث"); }} />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
