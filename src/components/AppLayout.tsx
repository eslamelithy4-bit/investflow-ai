import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, Users, Gift,
  LineChart, Bell, LogOut, Shield, LayoutDashboard, Menu, Settings as SettingsIcon,
  HelpCircle, Newspaper, FileText, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/deposit", label: "الإيداع", icon: ArrowDownToLine },
  { to: "/withdraw", label: "السحب", icon: ArrowUpFromLine },
  { to: "/referral", label: "رابط الإحالة", icon: Users },
  { to: "/bonus", label: "المكافآت اليومية", icon: Gift },
  { to: "/trade", label: "التداول", icon: LineChart },
  { to: "/balance", label: "الرصيد", icon: Wallet },
  { to: "/news", label: "الأخبار", icon: Newspaper },
  { to: "/faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  { to: "/settings", label: "الإعدادات", icon: SettingsIcon },
  { to: "/legal", label: "البنود والخصوصية", icon: FileText },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore((s) => s.currentUser());
  const logout = useStore((s) => s.logout);
  const brand = useStore((s) => s.settings.brandName);
  const notifs = useStore((s) =>
    s.notifications.filter((n) => !n.read).length
  );

  if (!user) {
    navigate("/login");
    return null;
  }

  const Sidebar = () => (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-black text-lg">{brand}</div>
            <div className="text-xs text-sidebar-foreground/60">AI Investing</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-elegant"
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
        {user.isAdmin && (
          <>
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium mt-4 border-t border-sidebar-border pt-4",
                location.pathname === "/admin"
                  ? "bg-warning text-warning-foreground"
                  : "hover:bg-sidebar-accent text-warning"
              )}
            >
              <Shield className="w-4 h-4" />
              لوحة الإدارة
            </Link>
            <Link
              to="/admin/advanced"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium",
                location.pathname === "/admin/advanced"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-sidebar-accent text-primary"
              )}
            >
              <Sparkles className="w-4 h-4" />
              التحكم المتقدم
            </Link>
          </>
        )}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2 text-xs text-sidebar-foreground/60 truncate">{user.email}</div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => { logout(); navigate("/login"); }}
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-64">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <h2 className="font-bold text-lg">
              {navItems.find((n) => n.to === location.pathname)?.label ||
                (location.pathname.startsWith("/admin") ? "لوحة الإدارة" : "")}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {user.isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin/notifications")}>
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {notifs > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                      {notifs}
                    </Badge>
                  )}
                </div>
              </Button>
            )}
            <div className="text-left hidden sm:block">
              <div className="text-xs text-muted-foreground">الرصيد</div>
              <div className="font-black text-primary">${user.balance.toFixed(2)}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
