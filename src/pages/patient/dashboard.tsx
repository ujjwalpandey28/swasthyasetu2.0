import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  Pill,
  Video,
  Siren,
  ArrowRight,
  QrCode as QrIcon,
  CreditCard,
  Receipt,
  FlaskConical,
  Stethoscope,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";

const visitLifecycleSteps = [
  { key: "BOOKED", label: "Appointment Booked" },
  { key: "CHECKED_IN", label: "Checked In (Token Issued)" },
  { key: "IN_CONSULTATION", label: "Doctor Consultation" },
  { key: "TESTS_PENDING", label: "Diagnostic Tests" },
  { key: "PHARMACY_PENDING", label: "Medicine Pharmacy" },
  { key: "COMPLETED", label: "Visit Completed" },
];

export function PatientDashboard() {
  const user = useAuthStore((s) => s.user);
  const patients = useHospitalDB((s) => s.patients);
  const visits = useHospitalDB((s) => s.visits);
  const testOrders = useHospitalDB((s) => s.testOrders);
  const prescriptions = useHospitalDB((s) => s.prescriptions);
  const bills = useHospitalDB((s) => s.bills);

  const currentPatient = useMemo(() => {
    if (!user) return patients[0];
    return (
      patients.find((p) => p.name.toLowerCase() === user.name.toLowerCase() || p.swasthyaId === user.id) ||
      patients[0]
    );
  }, [user, patients]);

  const activeVisit = useMemo(() => {
    return visits.find((v) => v.patientId === currentPatient.swasthyaId && v.status !== "COMPLETED");
  }, [visits, currentPatient]);

  const patientVisits = useMemo(() => {
    return visits.filter((v) => v.patientId === currentPatient.swasthyaId);
  }, [visits, currentPatient]);

  const patientTests = useMemo(() => {
    return testOrders.filter((t) => t.patientId === currentPatient.swasthyaId);
  }, [testOrders, currentPatient]);

  const patientPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => p.patientId === currentPatient.swasthyaId);
  }, [prescriptions, currentPatient]);

  const patientBills = useMemo(() => {
    return bills.filter((b) => b.patientId === currentPatient.swasthyaId);
  }, [bills, currentPatient]);

  // Live Queue Calculation
  const queueInfo = useMemo(() => {
    if (!activeVisit || !activeVisit.tokenNumber) return null;
    const tokenNum = parseInt(activeVisit.tokenNumber.replace(/\D/g, ""), 10) || 24;
    const currentServingNum = Math.max(1, tokenNum - 3);
    const prefix = activeVisit.tokenNumber.split("-")[0] || "A";
    const currentlyServing = `${prefix}-${String(currentServingNum).padStart(3, "0")}`;
    const ahead = Math.max(0, tokenNum - currentServingNum);
    return {
      token: activeVisit.tokenNumber,
      currentlyServing,
      ahead,
      estMinutes: ahead * 6,
    };
  }, [activeVisit]);

  // Current visit lifecycle index
  const activeStepIndex = useMemo(() => {
    if (!activeVisit) return -1;
    if (activeVisit.status === "BOOKED") return 0;
    if (activeVisit.status === "CHECKED_IN") return 1;
    if (activeVisit.status === "IN_CONSULTATION") return 2;
    if (activeVisit.status === "TESTS_PENDING") return 3;
    if (activeVisit.status === "PHARMACY_PENDING" || activeVisit.status === "MEDICINES_DISPENSED") return 4;
    if (activeVisit.status === "COMPLETED") return 5;
    return 1;
  }, [activeVisit]);

  const quickActions = [
    { to: "/patient/my-qr", label: "My Visit QR", icon: QrIcon, color: "bg-brand-700", desc: "Show at hospital" },
    { to: "/patient/health-card", label: "Digital Health Card", icon: CreditCard, color: "bg-teal-700", desc: "Permanent ID Card" },
    { to: "/patient/appointments", label: "Book Appointment", icon: CalendarClock, color: "bg-purple-600", desc: "Schedule consultation" },
    { to: "/patient/bills", label: "My Bills & Receipts", icon: Receipt, color: "bg-emerald-600", desc: "Dispensed medicine bills" },
    { to: "/patient/diagnostics", label: "My Lab Reports", icon: FlaskConical, color: "bg-blue-600", desc: "Test results" },
    { to: "/patient/teleconsultation", label: "Teleconsultation", icon: Video, color: "bg-sky-600", desc: "Video doctor call" },
    { to: "/patient/emergency", label: "Emergency", icon: Siren, color: "bg-red-600", desc: "Urgent care & helpline" },
  ];

  return (
    <div className="space-y-6">
      {/* Patient Header Banner with ID */}
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50 via-teal-50 to-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-md text-xl font-bold">
            {currentPatient.name.charAt(0)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-fg">Namaste, {currentPatient.name} 🙏</h1>
              <RiskBadge level={currentPatient.riskLevel} />
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Permanent Swasthya Patient ID:{" "}
              <span className="font-mono font-bold text-brand-700">{currentPatient.swasthyaId}</span> ·{" "}
              <span>{currentPatient.village}, {currentPatient.district}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/patient/health-card">
            <Button variant="outline" size="sm" className="bg-surface shadow-sm">
              <CreditCard className="h-4 w-4 text-brand-700" /> Digital Health Card
            </Button>
          </Link>
          <Link to="/patient/my-qr">
            <Button size="sm">
              <QrIcon className="h-4 w-4" /> My Visit QR
            </Button>
          </Link>
        </div>
      </div>

      {/* ACTIVE VISIT & LIVE QUEUE TRACKER */}
      {activeVisit && (
        <Card className="border-2 border-brand-500/80 bg-brand-50/30 p-5 shadow-lg space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-fg">Current Hospital Visit</h3>
                  <span className="font-mono text-xs font-bold text-brand-800 bg-brand-100 px-2 py-0.5 rounded">
                    {activeVisit.visitNumber}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {activeVisit.facilityName} · <strong>{activeVisit.doctorName}</strong> ({activeVisit.department})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Stage: {activeVisit.status.replace(/_/g, " ")}
              </span>
              <Link to="/patient/my-qr">
                <Button size="sm" variant="secondary">
                  <QrIcon className="h-3.5 w-3.5" /> Show QR
                </Button>
              </Link>
            </div>
          </div>

          {/* Live OPD Queue Status Box */}
          {queueInfo && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl bg-surface border border-brand-200 p-4 shadow-sm text-center">
              <div className="border-r border-border last:border-0">
                <span className="text-[11px] text-muted font-semibold uppercase">Your OPD Token</span>
                <p className="text-2xl font-black text-brand-700 mt-0.5">{queueInfo.token}</p>
                <p className="text-[10px] text-muted">{activeVisit.department}</p>
              </div>
              <div className="border-r border-border last:border-0">
                <span className="text-[11px] text-muted font-semibold uppercase">Currently Serving</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">{queueInfo.currentlyServing}</p>
                <p className="text-[10px] text-emerald-600">In Doctor Room</p>
              </div>
              <div className="border-r border-border last:border-0">
                <span className="text-[11px] text-muted font-semibold uppercase">Patients Ahead</span>
                <p className="text-2xl font-black text-amber-700 mt-0.5">{queueInfo.ahead}</p>
                <p className="text-[10px] text-muted">In Queue</p>
              </div>
              <div>
                <span className="text-[11px] text-muted font-semibold uppercase">Estimated Wait</span>
                <p className="text-2xl font-black text-fg mt-0.5">~{queueInfo.estMinutes}m</p>
                <p className="text-[10px] text-muted">Real-time sync</p>
              </div>
            </div>
          )}

          {/* Patient Hospital Journey Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-fg">Your Hospital Journey Workflow:</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 text-center text-xs">
              {visitLifecycleSteps.map((step, idx) => {
                const isDone = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                return (
                  <div
                    key={step.key}
                    className={`rounded-xl border p-2.5 transition ${
                      isCurrent
                        ? "border-brand-600 bg-brand-700 text-white font-bold shadow-md ring-2 ring-brand-400/30"
                        : isDone
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-medium"
                        : "border-border bg-surface text-muted"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider mb-1">
                      Step {idx + 1} {isDone ? "✓" : isCurrent ? "●" : ""}
                    </div>
                    <div className="text-xs leading-tight">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <CalendarClock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{patientVisits.length}</p>
            <p className="text-xs text-muted">Hospital Visits</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <FlaskConical className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{patientTests.length}</p>
            <p className="text-xs text-muted">Diagnostic Tests</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-700">
            <Pill className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{patientPrescriptions.length}</p>
            <p className="text-xs text-muted">Prescriptions</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Receipt className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{patientBills.length}</p>
            <p className="text-xs text-muted">Medicine Bills</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="mb-3 text-base font-bold text-fg">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to}>
              <Card className="flex items-center gap-3 p-3.5 transition hover:shadow-md hover:border-brand-300">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${a.color}`}>
                  <a.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-fg truncate">{a.label}</p>
                  <p className="text-[11px] text-muted truncate">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Prescriptions & Tests */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Prescriptions */}
        <Card>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <CardTitle>Recent Prescriptions</CardTitle>
            <Link to="/patient/medicine-availability" className="text-xs text-brand-700 font-semibold hover:underline">
              Medicine Counter →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {patientPrescriptions.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">No prescriptions yet.</p>
            ) : (
              patientPrescriptions.map((rx) => (
                <div key={rx.id} className="rounded-xl border border-border p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-fg">{rx.doctorName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rx.status === "DISPENSED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted">Diagnosis: {rx.diagnosis}</p>
                  <div className="space-y-1 pt-1">
                    {rx.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs bg-brand-50/50 px-2 py-1 rounded">
                        <span className="font-medium text-fg">• {item.medicineName}</span>
                        <span className="text-muted">{item.dosage} ({item.quantity} units)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Diagnostic Lab Tests */}
        <Card>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <CardTitle>Diagnostic Lab Orders</CardTitle>
            <Link to="/patient/diagnostics" className="text-xs text-brand-700 font-semibold hover:underline">
              View All Reports →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {patientTests.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">No diagnostic test orders.</p>
            ) : (
              patientTests.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-fg">{t.testName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        t.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted">Ordered by {t.doctorName} · {t.facilityName}</p>
                  {t.summary && (
                    <p className="text-xs font-medium text-emerald-700 bg-emerald-50 p-1.5 rounded mt-1">
                      Result: {t.summary}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}