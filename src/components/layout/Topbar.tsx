import { Link } from "react-router-dom";
import { Menu, Moon, Sun, LogOut, HeartPulse, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/components/utils/ThemeContext";
import { useLanguage } from "@/components/utils/LanguageContext";
import { LanguageSwitch } from "@/components/shared/LanguageSwitch";
import { UserRole } from "@/dto/constants/UserRole";

const roleLabels: Record<UserRole, string> = {
  [UserRole.PATIENT]: "Citizen / Patient",
  [UserRole.DOCTOR]: "Doctor",
  [UserRole.HOSPITAL_STAFF]: "Hospital Staff",
  [UserRole.LAB]: "Pathology & Diagnostics",
  [UserRole.PHARMACY]: "Pharmacy",
  [UserRole.HEALTHCARE_WORKER]: "Healthcare Worker",
  [UserRole.ADMIN]: "Hospital Administrator",
  [UserRole.SECURITY]: "Security Guard",
  [UserRole.SUPER_ADMIN]: "Super Administrator",
};

export function Topbar({ onMenu, hasSidebar = true }: { onMenu: () => void; hasSidebar?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const isPatient = user?.role === UserRole.PATIENT;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:px-6 shadow-sm">
      {hasSidebar && (
        <button
          onClick={onMenu}
          className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-fg lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Brand logo when no sidebar is present */}
      {!hasSidebar && (
        <Link to="/patient" className="flex items-center gap-2.5 mr-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm transition group-hover:scale-105">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div className="hidden sm:block">
            <span className="font-black text-sm tracking-tight text-fg">{t("app_name")}</span>
            <p className="text-[10px] text-muted -mt-0.5">Rural Health Network</p>
          </div>
        </Link>
      )}

      <div className="flex-1">
        <h1 className="text-sm font-semibold text-fg">
          {t("welcome")}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-xs text-muted">
          {user?.role ? roleLabels[user.role as UserRole] || user.role : ""} Portal
        </p>
      </div>

      {isPatient && (
        <Link
          to="/patient"
          className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-100 transition shadow-xs"
        >
          <LayoutDashboard className="h-3.5 w-3.5 text-brand-700" />
          <span>Dashboard</span>
        </Link>
      )}

      <LanguageSwitch />

      <button
        onClick={toggleTheme}
        className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-fg"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      <button
        onClick={logout}
        className="rounded-md p-2 text-muted hover:bg-brand-50 hover:text-danger"
        aria-label="Logout"
        title={t("logout")}
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}