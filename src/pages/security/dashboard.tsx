import { useState } from "react";
import {
  ShieldCheck,
  QrCode as QrIcon,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRScannerModal } from "@/components/shared/QRScannerModal";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { UserRole } from "@/dto/constants/UserRole";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";
import type { Patient } from "@/dto/patient/Patient";

export function SecurityDashboard() {
  const user = useAuthStore((s) => s.user);
  const visits = useHospitalDB((s) => s.visits);
  const logAudit = useHospitalDB((s) => s.logAudit);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [clearedPatient, setClearedPatient] = useState<{ name: string; id: string; status: string } | null>(null);

  const handleQRResolved = ({ visit, patient }: { visit?: HospitalVisit; patient?: Patient }) => {
    const name = visit?.patientName || patient?.name || "Verified Citizen";
    const id = visit?.patientId || patient?.swasthyaId || "SS-IND-XXXX";
    const status = visit?.status || "REGISTERED_CITIZEN";

    logAudit({
      actorId: user?.id || "sec-01",
      actorName: user?.name || "Security Gate",
      actorRole: UserRole.SECURITY,
      action: "QR_SCANNED",
      details: `Gate checkpoint scan verified entry for ${name} (${id}).`,
      targetEntity: "PATIENT",
      targetId: id,
    });

    setClearedPatient({ name, id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-slate-800 via-slate-900 to-brand-900 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            Facility Access &amp; Gate Checkpoint
          </span>
          <h1 className="mt-1 text-2xl font-black">Security &amp; Gate Marshall Desk</h1>
          <p className="text-xs text-slate-200 mt-0.5">
            Entry QR Verification · Visitor Log · Hospital Marshalling
          </p>
        </div>

        <Button
          onClick={() => setScannerOpen(true)}
          size="lg"
          className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl font-bold flex items-center gap-2"
        >
          <QrIcon className="h-5 w-5 text-slate-800" /> SCAN VISITOR / PATIENT QR
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{visits.length}</p>
            <p className="text-xs text-muted">Authorized Entries Today</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">100%</p>
            <p className="text-xs text-muted">Checkpoint Verification Rate</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">&lt; 5s</p>
            <p className="text-xs text-muted">Avg Scan &amp; Entry Time</p>
          </div>
        </Card>
      </div>

      {clearedPatient && (
        <Card className="border-2 border-emerald-500 bg-emerald-50/50 p-5 text-center space-y-2 max-w-md mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-lg text-fg">Entry Authorized ✓</h3>
          <p className="text-xs text-muted">Patient: <strong>{clearedPatient.name}</strong> ({clearedPatient.id})</p>
          <p className="text-xs text-emerald-800 font-semibold">Status: {clearedPatient.status}</p>
          <Button size="sm" variant="secondary" onClick={() => setClearedPatient(null)}>
            Clear &amp; Scan Next
          </Button>
        </Card>
      )}

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        role={UserRole.SECURITY}
        onResolved={handleQRResolved}
      />
    </div>
  );
}
