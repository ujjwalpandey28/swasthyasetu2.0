import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  HeartPulse,
  Pill,
  FlaskConical,
  Video,
  Siren,
  Users,
  Stethoscope,
  AlertTriangle,
  ListChecks,
  Activity,
  CloudOff,
  Loader,
  Workflow,
  ClipboardList,
  CreditCard,
  QrCode,
  Receipt,
  ShieldCheck,
  Package,
  Globe,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { UserRole } from "@/dto/constants/UserRole";
import { useLanguage } from "@/components/utils/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: TranslationKey;
  icon: LucideIcon;
}

const patientNav: NavItem[] = [
  { to: "/patient", label: "dashboard", icon: LayoutDashboard },
  { to: "/patient/my-qr", label: "my_qr", icon: QrCode },
  { to: "/patient/health-card", label: "health_card", icon: CreditCard },
  { to: "/patient/appointments", label: "appointments", icon: CalendarClock },
  { to: "/patient/bills", label: "bills", icon: Receipt },
  { to: "/patient/health-records", label: "health_records", icon: HeartPulse },
  { to: "/patient/medicine-availability", label: "medicine_availability", icon: Pill },
  { to: "/patient/diagnostics", label: "diagnostics", icon: FlaskConical },
  { to: "/patient/find-facility", label: "find_facility", icon: Building2 },
  { to: "/patient/teleconsultation", label: "teleconsultation", icon: Video },
  { to: "/patient/emergency", label: "emergency", icon: Siren },
];

const doctorNav: NavItem[] = [
  { to: "/doctor", label: "dashboard", icon: LayoutDashboard },
  { to: "/doctor/consultation", label: "doctor_consultation", icon: Stethoscope },
  { to: "/worker/patients", label: "patients", icon: Users },
  { to: "/worker/high-risk", label: "high_risk", icon: AlertTriangle },
  { to: "/worker/follow-ups", label: "follow_ups", icon: CalendarClock },
  { to: "/worker/referrals", label: "referrals", icon: Workflow },
];

const hospitalStaffNav: NavItem[] = [
  { to: "/hospital", label: "hospital_reception", icon: Building2 },
  { to: "/worker/patients", label: "patients", icon: Users },
  { to: "/admin/queue", label: "queue", icon: ClipboardList },
  { to: "/worker/triage", label: "triage", icon: ListChecks },
  { to: "/admin/referrals", label: "referrals", icon: Workflow },
];

const labNav: NavItem[] = [
  { to: "/lab", label: "lab_diagnostics", icon: FlaskConical },
  { to: "/admin/diagnostics", label: "diagnostics", icon: Activity },
];

const pharmacyNav: NavItem[] = [
  { to: "/pharmacy", label: "pharmacy_dispense", icon: Pill },
  { to: "/admin/medicines", label: "medicine_availability", icon: Package },
];

const workerNav: NavItem[] = [
  { to: "/worker", label: "dashboard", icon: LayoutDashboard },
  { to: "/worker/patients", label: "patients", icon: Users },
  { to: "/worker/triage", label: "triage", icon: ListChecks },
  { to: "/worker/consultation", label: "begin_consultation", icon: Stethoscope },
  { to: "/worker/high-risk", label: "high_risk", icon: AlertTriangle },
  { to: "/worker/follow-ups", label: "follow_ups", icon: CalendarClock },
  { to: "/worker/referrals", label: "referrals", icon: Workflow },
  { to: "/worker/offline-sync", label: "offline_sync", icon: CloudOff },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "dashboard", icon: LayoutDashboard },
  { to: "/admin/audit-logs", label: "audit_logs", icon: ShieldCheck },
  { to: "/admin/queue", label: "queue", icon: ClipboardList },
  { to: "/admin/medicines", label: "medicine_availability", icon: Pill },
  { to: "/admin/workload", label: "workload", icon: Activity },
  { to: "/admin/referrals", label: "referral_status", icon: Loader },
  { to: "/admin/high-risk", label: "high_risk", icon: AlertTriangle },
  { to: "/admin/diagnostics", label: "diagnostics", icon: FlaskConical },
  { to: "/admin/analytics", label: "analytics", icon: Activity },
];

const securityNav: NavItem[] = [
  { to: "/security", label: "security_desk", icon: ShieldCheck },
  { to: "/admin/audit-logs", label: "audit_logs", icon: ClipboardList },
];

const superAdminNav: NavItem[] = [
  { to: "/super-admin", label: "super_admin", icon: Globe },
  { to: "/admin/audit-logs", label: "audit_logs", icon: ShieldCheck },
  { to: "/admin/analytics", label: "analytics", icon: Activity },
  { to: "/admin/medicines", label: "medicine_availability", icon: Package },
];

const navByRole: Record<UserRole, NavItem[]> = {
  [UserRole.PATIENT]: patientNav,
  [UserRole.DOCTOR]: doctorNav,
  [UserRole.HOSPITAL_STAFF]: hospitalStaffNav,
  [UserRole.LAB]: labNav,
  [UserRole.PHARMACY]: pharmacyNav,
  [UserRole.HEALTHCARE_WORKER]: workerNav,
  [UserRole.ADMIN]: adminNav,
  [UserRole.SECURITY]: securityNav,
  [UserRole.SUPER_ADMIN]: superAdminNav,
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  if (!userRole || userRole === UserRole.PATIENT) return null;
  const nav = navByRole[userRole] || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform lg:sticky lg:top-0 lg:translate-x-0 shadow-sm",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <span className="font-black text-sm tracking-tight text-fg">{t("app_name")}</span>
              <p className="text-[10px] text-muted -mt-0.5">Rural Health Network</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={item.to === "/patient" || item.to === "/doctor" || item.to === "/admin" || item.to === "/hospital" || item.to === "/lab" || item.to === "/pharmacy" || item.to === "/worker" || item.to === "/security" || item.to === "/super-admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-muted hover:bg-brand-50 hover:text-fg"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}