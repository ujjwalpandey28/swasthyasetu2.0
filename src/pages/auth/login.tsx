import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeartPulse, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LanguageSwitch } from "@/components/shared/LanguageSwitch";
import { useLanguage } from "@/components/utils/LanguageContext";
import { UserRole } from "@/dto/constants/UserRole";
import { demoAccounts } from "@/lib/database/seedData";
import { roleRoutes } from "@/components/shared/DemoSwitcher";

export function LoginPage() {
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const loginUser = useAuthStore((s) => s.loginUser);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(identifier.trim(), role);
      navigate(roleRoutes[role]);
    } catch {
      setError("Login failed. Please verify your ID or select a demo account.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (account: (typeof demoAccounts)[0]) => {
    loginUser(account.user);
    navigate(roleRoutes[account.role]);
  };

  const currentRoleDemoAccounts = demoAccounts.filter((a) => a.role === role);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <Card className="w-full max-w-xl shadow-2xl overflow-hidden p-0 border border-border">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 p-6 text-white text-center relative">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-white shadow-inner">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">{t("app_name")}</h1>
          <p className="text-xs text-brand-100 mt-1 font-medium">{t("tagline")}</p>
          <div className="mt-3 flex justify-center">
            <LanguageSwitch />
          </div>
        </div>

        <div className="p-6 space-y-5 bg-surface">
          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">
                Select Your Role
              </label>
              <Select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as UserRole);
                  setIdentifier("");
                }}
              >
                <option value={UserRole.PATIENT}>🧑‍🦰 Citizen / Patient</option>
                <option value={UserRole.DOCTOR}>🩺 Doctor (Consultation &amp; Rx)</option>
                <option value={UserRole.HOSPITAL_STAFF}>🏢 Hospital Staff / Reception</option>
                <option value={UserRole.LAB}>🧪 Diagnostic / Pathology Lab</option>
                <option value={UserRole.PHARMACY}>💊 Pharmacy / Medicine Dispensing</option>
                <option value={UserRole.HEALTHCARE_WORKER}>👩‍⚕️ Healthcare Worker (ASHA/ANM)</option>
                <option value={UserRole.ADMIN}>📊 Hospital Administration</option>
                <option value={UserRole.SECURITY}>🛡️ Security Guard</option>
                <option value={UserRole.SUPER_ADMIN}>⚡ Super Admin (State/National)</option>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">
                Swasthya Patient ID, Username, or Mobile
              </label>
              <Input
                placeholder={`e.g. ${currentRoleDemoAccounts[0]?.username || "patient01"} or SS-IND-00024581`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : `${t("login")} as ${role.replace(/_/g, " ")}`}
            </Button>
          </form>

          {/* 1-Click Demo Accounts Selector for the Chosen Role */}
          <div className="rounded-xl border border-border bg-brand-50/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-bold text-brand-800">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                1-Click Demo Accounts ({currentRoleDemoAccounts.length})
              </span>
              <span className="text-[10px] text-muted">Click any to instantly enter</span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {currentRoleDemoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5 text-left text-xs transition hover:border-brand-600 hover:bg-brand-50"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-fg truncate">{acc.user.name.split("(")[0]}</p>
                    <p className="text-[10px] text-muted font-mono">{acc.username}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-muted">New rural citizen?</span>
            <Link to="/register" className="font-bold text-brand-700 hover:underline flex items-center gap-1">
              Create SwasthyaSetu ID <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}