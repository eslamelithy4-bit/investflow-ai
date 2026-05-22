import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeApplier from "@/components/ThemeApplier";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Referral from "./pages/Referral";
import Bonus from "./pages/Bonus";
import Trade from "./pages/Trade";
import Balance from "./pages/Balance";
import Admin from "./pages/Admin";
import AdvancedAdmin from "./pages/AdvancedAdmin";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import Legal from "./pages/Legal";
import UserSettings from "./pages/UserSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeApplier />
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/bonus" element={<Bonus />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/news" element={<News />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/advanced" element={<AdvancedAdmin />} />
          <Route path="/admin/notifications" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
