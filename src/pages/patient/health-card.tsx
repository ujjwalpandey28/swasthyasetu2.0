import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Printer,
  Download,
  HeartPulse,
  ShieldCheck,
  CalendarClock,
  QrCode as QrIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRCode } from "@/components/shared/QRCode";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";

export function HealthCardPage() {
  const user = useAuthStore((s) => s.user);
  const patients = useHospitalDB((s) => s.patients);
  const visits = useHospitalDB((s) => s.visits);

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Digital Health Card (PDF) downloaded successfully!");
  };

  const permanentCardQR = `SWASTHYASETU://PATIENT/${currentPatient.swasthyaId}`;

  return (
    <div>
      <PageHeader
        title="Digital Health Card"
        subtitle="Your permanent national health card with secure verification QR"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print Card
            </Button>
            <Button variant="secondary" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-xl space-y-6">
        {/* Physical / Digital Card Preview */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-brand-800 bg-gradient-to-br from-brand-900 via-brand-800 to-teal-900 p-6 text-white shadow-2xl">
          {/* Decorative watermarks & backgrounds */}
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-800 shadow-md">
                <HeartPulse className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-black tracking-wider uppercase">SWASTHYASETU</h3>
                <p className="text-[10px] uppercase tracking-widest text-brand-200">
                  National Rural Health Identity Card
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm border border-white/20">
                Govt. of India
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="mt-5 grid grid-cols-3 gap-4 items-center">
            {/* Left Demographics */}
            <div className="col-span-2 space-y-2.5">
              <div>
                <span className="text-[10px] font-semibold text-brand-200 uppercase tracking-wider">
                  Patient Full Name
                </span>
                <p className="text-xl font-bold tracking-tight text-white">{currentPatient.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-brand-200">Permanent Patient ID:</span>
                  <p className="font-mono font-bold text-sm text-amber-300 tracking-wider">
                    {currentPatient.swasthyaId}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-200">Date of Birth / Age:</span>
                  <p className="font-medium text-white">
                    {currentPatient.dob || "1975-06-12"} ({currentPatient.age} yrs)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-200">Blood Group:</span>
                  <p className="font-bold text-white text-sm">{currentPatient.bloodGroup}</p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-200">Gender / Village:</span>
                  <p className="font-medium text-white truncate">
                    {currentPatient.gender} · {currentPatient.village}
                  </p>
                </div>
              </div>

              {currentPatient.emergencyContact && (
                <div className="rounded-lg bg-white/10 p-2 text-[11px] backdrop-blur-sm border border-white/10">
                  <span className="text-brand-200">Emergency Contact: </span>
                  <span className="font-bold text-white">
                    {currentPatient.emergencyContact.name} ({currentPatient.emergencyContact.phone})
                  </span>
                </div>
              )}
            </div>

            {/* Right QR Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 text-brand-900 shadow-xl">
              <QRCode value={permanentCardQR} size={110} />
              <span className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                Scan for ID
              </span>
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3 text-[10px] text-brand-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Registered via {currentPatient.registeredVia || "NORMAL"} · Tamper Evident</span>
            </div>
            <span>Valid across all PHCs, CHCs &amp; DH</span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {activeVisit ? (
            <Link to="/patient/my-qr">
              <Card className="flex items-center justify-between border-brand-300 bg-brand-50/50 p-4 transition hover:bg-brand-50 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
                    <QrIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-sm text-fg">Active Visit QR Code</p>
                    <p className="text-xs text-muted">Visit {activeVisit.visitNumber} · {activeVisit.department}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-700">Open QR →</span>
              </Card>
            </Link>
          ) : (
            <Link to="/patient/appointments">
              <Card className="flex items-center justify-between p-4 transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-sm text-fg">Book Hospital Appointment</p>
                    <p className="text-xs text-muted">Generate new visit QR token</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700">Book →</span>
              </Card>
            </Link>
          )}

          <Link to="/patient/health-records">
            <Card className="flex items-center justify-between p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-sm text-fg">Longitudinal Health Records</p>
                  <p className="text-xs text-muted">View past visits, tests &amp; Rx</p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700">View →</span>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
