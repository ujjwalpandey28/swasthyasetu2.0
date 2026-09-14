import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  QrCode as QrIcon,
  Users,
  CheckCircle2,
  FlaskConical,
  Pill,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RiskBadge } from "@/components/ui/Badge";
import { QRScannerModal } from "@/components/shared/QRScannerModal";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { UserRole } from "@/dto/constants/UserRole";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";
import type { Patient } from "@/dto/patient/Patient";

export function DoctorDashboard() {
  const user = useAuthStore((s) => s.user);
  const visits = useHospitalDB((s) => s.visits);
  const prescriptions = useHospitalDB((s) => s.prescriptions);
  const testOrders = useHospitalDB((s) => s.testOrders);
  const navigate = useNavigate();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const doctorName = user?.name || "Dr. Anita Rao";

  // Filter visits for this doctor or checked-in queue
  const doctorVisits = useMemo(() => {
    return visits.filter(
      (v) => v.doctorName.toLowerCase().includes(doctorName.toLowerCase()) || !v.doctorName
    );
  }, [visits, doctorName]);

  const waitingQueue = useMemo(() => {
    return doctorVisits.filter(
      (v) => v.status === "CHECKED_IN" || v.status === "WAITING_FOR_DOCTOR" || v.status === "IN_CONSULTATION"
    );
  }, [doctorVisits]);

  const completedToday = useMemo(() => {
    return doctorVisits.filter(
      (v) => v.status === "COMPLETED" || v.status === "TESTS_PENDING" || v.status === "PHARMACY_PENDING"
    );
  }, [doctorVisits]);

  const handleQRResolved = ({ visit }: { visit?: HospitalVisit; patient?: Patient }) => {
    if (visit) {
      navigate(`/doctor/consultation?visitId=${visit.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-blue-700 via-indigo-800 to-brand-800 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            Clinical Portal · General Medicine &amp; OPD
          </span>
          <h1 className="mt-1 text-2xl font-black">{doctorName}</h1>
          <p className="text-xs text-blue-100 mt-0.5">
            Active OPD Queue · Clinical Consultation Suite · E-Prescription &amp; Diagnostic Orders
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setScannerOpen(true)}
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl font-bold flex items-center gap-2"
          >
            <QrIcon className="h-5 w-5 text-blue-700" /> SCAN PATIENT QR
          </Button>
          {waitingQueue.length > 0 && (
            <Link to={`/doctor/consultation?visitId=${waitingQueue[0].id}`}>
              <Button variant="secondary" className="border-white/30 text-white hover:bg-white/10">
                <Stethoscope className="h-4 w-4" /> Next Patient ({waitingQueue[0].tokenNumber})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{waitingQueue.length}</p>
            <p className="text-xs text-muted">Patients in Waiting Queue</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{completedToday.length}</p>
            <p className="text-xs text-muted">Consultations Completed</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
            <FlaskConical className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{testOrders.length}</p>
            <p className="text-xs text-muted">Diagnostic Tests Ordered</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-700">
            <Pill className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{prescriptions.length}</p>
            <p className="text-xs text-muted">Prescriptions Issued</p>
          </div>
        </Card>
      </div>

      {/* OPD Waiting Queue Table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg">Checked-In Patient Waiting Queue</h2>
            <p className="text-xs text-muted">Patients waiting outside doctor room with assigned OPD tokens</p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search queue by name or token…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-blue-50/50 text-muted uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">OPD Token</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Swasthya ID</th>
                  <th className="p-3">Reason / Complaint</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {waitingQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      No patients currently waiting in queue. Scan patient QR to start a consultation.
                    </td>
                  </tr>
                ) : (
                  waitingQueue.map((v) => (
                    <tr key={v.id} className="hover:bg-blue-50/20 transition">
                      <td className="p-3">
                        <span className="font-mono font-black text-sm text-blue-800 bg-blue-100/70 px-2.5 py-1 rounded-lg border border-blue-200">
                          {v.tokenNumber || "A-024"}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-sm text-fg">{v.patientName}</p>
                        <p className="text-[11px] text-muted">{v.patientAge || 45}y · {v.patientGender || "Female"}</p>
                      </td>
                      <td className="p-3 font-mono font-medium text-brand-700">{v.patientId}</td>
                      <td className="p-3 text-fg max-w-xs truncate">{v.reason || "General consultation"}</td>
                      <td className="p-3">
                        <RiskBadge level={v.riskLevel || "LOW"} />
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                          {v.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link to={`/doctor/consultation?visitId=${v.id}`}>
                          <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white">
                            <Stethoscope className="h-3.5 w-3.5" /> Start Consultation
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        role={UserRole.DOCTOR}
        onResolved={handleQRResolved}
      />
    </div>
  );
}
