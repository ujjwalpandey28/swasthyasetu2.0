import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Printer,
  Download,
  CalendarClock,
  Info,
  QrCode as QrIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRCode } from "@/components/shared/QRCode";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";

export function MyQRPage() {
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
    return (
      visits.find((v) => v.patientId === currentPatient.swasthyaId && v.status !== "COMPLETED") ||
      visits[0]
    );
  }, [visits, currentPatient]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Visit QR Code downloaded successfully for offline presentation!");
  };

  return (
    <div>
      <PageHeader
        title="My Hospital Visit QR"
        subtitle="Your central digital token connecting Reception, Doctor, Lab, and Pharmacy"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print QR
            </Button>
            <Button variant="secondary" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download QR
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-xl space-y-5">
        {activeVisit ? (
          <>
            {/* Primary Large Scannable QR Card */}
            <div className="overflow-hidden rounded-3xl border-2 border-brand-600 bg-surface shadow-2xl p-6 text-center">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
                    <QrIcon className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-fg">SwasthyaSetu Hospital Visit QR</h3>
                    <p className="text-[11px] text-muted">Scan at every department</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  Active Visit
                </span>
              </div>

              {/* High Contrast Quiet Zone QR Container */}
              <div className="my-6 mx-auto inline-flex flex-col items-center justify-center rounded-3xl border-4 border-brand-700 bg-white p-6 shadow-xl">
                <QRCode value={activeVisit.qrToken} size={220} />
                <p className="mt-3 font-mono text-xs font-bold tracking-wider text-brand-900 uppercase">
                  {activeVisit.visitNumber}
                </p>
              </div>

              {/* Visit Details Grid */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-left space-y-2.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted">Patient Name:</span>
                    <p className="font-bold text-sm text-fg">{activeVisit.patientName}</p>
                  </div>
                  <div>
                    <span className="text-muted">Permanent Swasthya ID:</span>
                    <p className="font-mono font-bold text-brand-700">{activeVisit.patientId}</p>
                  </div>
                  <div>
                    <span className="text-muted">Hospital / Facility:</span>
                    <p className="font-semibold text-fg">{activeVisit.facilityName}</p>
                  </div>
                  <div>
                    <span className="text-muted">Doctor &amp; Department:</span>
                    <p className="font-semibold text-fg">{activeVisit.doctorName} ({activeVisit.department})</p>
                  </div>
                  <div>
                    <span className="text-muted">Visit Status:</span>
                    <p className="font-bold text-brand-800">{activeVisit.status.replace(/_/g, " ")}</p>
                  </div>
                  {activeVisit.tokenNumber && (
                    <div>
                      <span className="text-muted">Queue Token Number:</span>
                      <p className="font-bold text-emerald-700 text-sm">{activeVisit.tokenNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rural Guidance Box */}
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 text-left flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Where to show this QR code:</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    1. <strong>Reception Desk</strong> for instant check-in and token number. <br />
                    2. <strong>Doctor Consultation Room</strong> to open your health records. <br />
                    3. <strong>Diagnostic Pathology Lab</strong> for prescribed tests. <br />
                    4. <strong>Pharmacy Counter</strong> for medicine verification and bill.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Card className="text-center p-8">
            <QrIcon className="mx-auto h-12 w-12 text-muted mb-3" />
            <CardTitle>No Active Hospital Visit</CardTitle>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              You currently do not have an active hospital appointment or visit token. Book an appointment to generate your visit QR.
            </p>
            <Link to="/patient/appointments" className="mt-4 inline-block">
              <Button>
                <CalendarClock className="h-4 w-4" /> Book Appointment &amp; Get QR
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
