import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, RefreshCw, ChevronDown, Sparkles, X, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { demoAccounts } from "@/lib/database/seedData";
import { UserRole } from "@/dto/constants/UserRole";

export const roleRoutes: Record<UserRole, string> = {
  [UserRole.PATIENT]: "/patient",
  [UserRole.HEALTHCARE_WORKER]: "/worker",
  [UserRole.HOSPITAL_STAFF]: "/hospital",
  [UserRole.DOCTOR]: "/doctor",
  [UserRole.LAB]: "/lab",
  [UserRole.PHARMACY]: "/pharmacy",
  [UserRole.ADMIN]: "/admin",
  [UserRole.SECURITY]: "/security",
  [UserRole.SUPER_ADMIN]: "/super-admin",
};

const roleLabels: Record<UserRole, { label: string; icon: string; color: string }> = {
  [UserRole.PATIENT]: { label: "Patient", icon: "🧑‍🦰", color: "bg-emerald-500/10 text-emerald-700 border-emerald-300" },
  [UserRole.DOCTOR]: { label: "Doctor", icon: "🩺", color: "bg-blue-500/10 text-blue-700 border-blue-300" },
  [UserRole.HOSPITAL_STAFF]: { label: "Hospital Staff / Reception", icon: "🏢", color: "bg-indigo-500/10 text-indigo-700 border-indigo-300" },
  [UserRole.LAB]: { label: "Lab / Diagnostics", icon: "🧪", color: "bg-purple-500/10 text-purple-700 border-purple-300" },
  [UserRole.PHARMACY]: { label: "Pharmacy / Dispensing", icon: "💊", color: "bg-amber-500/10 text-amber-700 border-amber-300" },
  [UserRole.HEALTHCARE_WORKER]: { label: "Healthcare Worker (ASHA)", icon: "👩‍⚕️", color: "bg-teal-500/10 text-teal-700 border-teal-300" },
  [UserRole.ADMIN]: { label: "Hospital Admin", icon: "📊", color: "bg-rose-500/10 text-rose-700 border-rose-300" },
  [UserRole.SECURITY]: { label: "Security Guard", icon: "🛡️", color: "bg-slate-500/10 text-slate-700 border-slate-300" },
  [UserRole.SUPER_ADMIN]: { label: "Super Admin", icon: "⚡", color: "bg-orange-500/10 text-orange-700 border-orange-300" },
};

export function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | "ALL">("ALL");
  const user = useAuthStore((s) => s.user);
  const loginUser = useAuthStore((s) => s.loginUser);
  const resetDatabase = useHospitalDB((s) => s.resetDatabase);
  const navigate = useNavigate();

  const handleSelectUser = (account: (typeof demoAccounts)[0]) => {
    loginUser(account.user);
    setOpen(false);
    navigate(roleRoutes[account.role]);
  };

  const handleReset = () => {
    if (window.confirm("Reset database to initial demo state? All mock visits and bills will reset.")) {
      resetDatabase();
      alert("Database reset to clean initial demo seed!");
    }
  };

  const filteredAccounts =
    selectedRoleFilter === "ALL"
      ? demoAccounts
      : demoAccounts.filter((a) => a.role === selectedRoleFilter);

  return (
    <>
      {/* Floating Demo Pill Bar */}
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-full border border-border/80 bg-surface/95 px-3 py-1.5 shadow-xl backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Demo Mode
        </span>
        {user && (
          <span className="hidden sm:inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 border border-brand-200">
            {roleLabels[user.role]?.icon} {user.name} ({roleLabels[user.role]?.label || user.role})
          </span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-brand-600 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Switch Role / User</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        <button
          onClick={handleReset}
          title="Reset database seed data"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition hover:bg-red-50 hover:text-red-600"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Demo Switcher Modal / Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-brand-50/70 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
                  <UserCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-fg">SwasthyaSetu Demo Role Switcher</h3>
                  <p className="text-xs text-muted">5 Realistic accounts per role (45 Total Seeded Users)</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-brand-50/20 p-2.5 text-xs">
              <button
                onClick={() => setSelectedRoleFilter("ALL")}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  selectedRoleFilter === "ALL"
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-surface text-muted hover:text-fg border border-border"
                }`}
              >
                All (45)
              </button>
              {Object.entries(roleLabels).map(([roleKey, info]) => (
                <button
                  key={roleKey}
                  onClick={() => setSelectedRoleFilter(roleKey as UserRole)}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium transition ${
                    selectedRoleFilter === roleKey
                      ? "bg-brand-700 text-white shadow-sm"
                      : "bg-surface text-muted hover:text-fg border border-border"
                  }`}
                >
                  {info.icon} {info.label.split("/")[0]}
                </button>
              ))}
            </div>

            {/* Accounts List Grid */}
            <div className="grid flex-1 gap-2.5 overflow-y-auto p-4 sm:grid-cols-2">
              {filteredAccounts.map((acc) => {
                const isCurrent = user?.id === acc.user.id;
                const roleMeta = roleLabels[acc.role];
                return (
                  <button
                    key={acc.username}
                    onClick={() => handleSelectUser(acc)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition hover:scale-[1.01] hover:shadow-md ${
                      isCurrent
                        ? "border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20"
                        : "border-border bg-surface hover:border-brand-300"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg border border-brand-100">
                      {roleMeta?.icon || "👤"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-sm text-fg truncate">{acc.user.name}</p>
                        <span className="rounded bg-brand-100/70 px-1.5 py-0.5 text-[10px] font-mono font-medium text-brand-800">
                          {acc.username}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate mt-0.5">{acc.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${roleMeta?.color}`}>
                          {roleMeta?.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-brand-700">✓ Active</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border bg-surface px-5 py-3 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-brand-600" />
                <span>Development & Demo Mode Enabled</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Database Seed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
