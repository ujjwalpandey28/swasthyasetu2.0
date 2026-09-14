import { useState, useMemo } from "react";
import {
  QrCode as QrIcon,
  UserCheck,
  CheckCircle2,
  Clock,
  Users,
  CalendarClock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/shared/QRScannerModal";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { UserRole } from "@/dto/constants/UserRole";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";
import type { Patient } from "@/dto/patient/Patient";

export function HospitalDashboard() {
  const user = useAuthStore((s) => s.user);
  const visits = useHospitalDB((s) => s.visits);
  const patients = useHospitalDB((s) => s.patients);
  const facilities = useHospitalDB((s) => s.facilities);
  const checkInVisit = useHospitalDB((s) => s.checkInVisit);
  const createVisit = useHospitalDB((s) => s.createVisit);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<HospitalVisit | null>(null);
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form for walk-in / emergency
  const [walkinPatientId, setWalkinPatientId] = useState(patients[0]?.swasthyaId || "");
  const [walkinDept, setWalkinDept] = useState("General Medicine");
  const [walkinDoc, setWalkinDoc] = useState("Dr. Anita Rao");
  const [walkinReason, setWalkinReason] = useState("Walk-in emergency consultation");

  const facility = useMemo(() => {
    return facilities.find((f) => f.id === user?.facilityId) || facilities[0];
  }, [facilities, user]);

  const todayVisits = useMemo(() => {
    return visits.filter((v) => v.facilityId === facility.id || !v.facilityId);
  }, [visits, facility]);

  const filteredVisits = useMemo(() => {
    if (!searchQuery.trim()) return todayVisits;
    const q = searchQuery.toLowerCase().trim();
    return todayVisits.filter(
      (v) =>
        v.patientName.toLowerCase().includes(q) ||
        v.patientId.toLowerCase().includes(q) ||
        v.visitNumber.toLowerCase().includes(q) ||
        (v.tokenNumber && v.tokenNumber.toLowerCase().includes(q))
    );
  }, [todayVisits, searchQuery]);

  const handleQRResolved = ({ visit, patient }: { visit?: HospitalVisit; patient?: Patient }) => {
    if (visit) {
      setSelectedVisit(visit);
    } else if (patient) {
      // Create instant walk-in visit for patient
      const newV = createVisit({
        patientId: patient.swasthyaId,
        facilityId: facility.id,
        doctorName: "Dr. Anita Rao",
        department: "General Medicine",
        reason: "OPD Walk-in Arrival",
      });
      setSelectedVisit(newV);
    }
  };

  const handleCheckIn = (visitId: string) => {
    try {
      const { visit, tokenNumber } = checkInVisit(visitId, user?.name || "Rajesh Tiwari");
      setSelectedVisit(visit);
      setIssuedToken(tokenNumber);
    } catch (err: any) {
      alert(err.message || "Failed to check in visit");
    }
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newV = createVisit({
      patientId: walkinPatientId,
      facilityId: facility.id,
      doctorName: walkinDoc,
      department: walkinDept,
      reason: walkinReason,
    });
    const { visit, tokenNumber } = checkInVisit(newV.id, user?.name || "Reception Desk");
    setWalkinOpen(false);
    setSelectedVisit(visit);
    setIssuedToken(tokenNumber);
  };

  const checkedInCount = todayVisits.filter((v) => v.status === "CHECKED_IN" || v.status === "IN_CONSULTATION").length;
  const bookedCount = todayVisits.filter((v) => v.status === "BOOKED").length;
  const completedCount = todayVisits.filter((v) => v.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-brand-700 via-brand-800 to-indigo-900 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Hospital Operations &amp; Reception
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black">{facility.name}</h1>
          <p className="text-xs text-brand-100 mt-0.5">
            Reception Desk · OPD Token Management · Patient Check-In
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setScannerOpen(true)}
            size="lg"
            className="bg-white text-brand-900 hover:bg-brand-50 shadow-xl font-bold flex items-center gap-2"
          >
            <QrIcon className="h-5 w-5 text-brand-700" /> SCAN PATIENT QR
          </Button>
          <Button
            variant="outline"
            onClick={() => setWalkinOpen(true)}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <UserCheck className="h-4 w-4" /> Walk-In Check-In
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{todayVisits.length}</p>
            <p className="text-xs text-muted">Total Visits Today</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <CalendarClock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{bookedCount}</p>
            <p className="text-xs text-muted">Awaiting Check-in</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{checkedInCount}</p>
            <p className="text-xs text-muted">In OPD Queue / Rooms</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{completedCount}</p>
            <p className="text-xs text-muted">Completed Visits</p>
          </div>
        </Card>
      </div>

      {/* Main Queue & Check-in Desk */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg">OPD Patient Queue &amp; Check-In</h2>
            <p className="text-xs text-muted">Scan QR or enter Patient ID to check in and issue OPD token</p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name, ID, or token…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-brand-50/70 text-muted uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Token</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Department &amp; Doctor</th>
                  <th className="p-3">Visit No</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted">
                      No matching patient visits found. Use the Scan QR button above to check in a patient.
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-brand-50/30 transition">
                      <td className="p-3">
                        {v.tokenNumber ? (
                          <span className="font-mono font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {v.tokenNumber}
                          </span>
                        ) : (
                          <span className="text-muted font-mono text-xs">Not Checked In</span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-sm text-fg">{v.patientName}</p>
                        <p className="font-mono text-[11px] text-muted">{v.patientId}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-fg">{v.department}</p>
                        <p className="text-muted text-[11px]">{v.doctorName}</p>
                      </td>
                      <td className="p-3 font-mono text-muted">{v.visitNumber}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            v.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : v.status === "CHECKED_IN"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : v.status === "IN_CONSULTATION"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {v.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {v.status === "BOOKED" ? (
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(v.id)}
                            className="bg-brand-700 text-white hover:bg-brand-600"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Check In &amp; Token
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedVisit(v)}
                          >
                            View Pass
                          </Button>
                        )}
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
        role={UserRole.HOSPITAL_STAFF}
        onResolved={handleQRResolved}
      />

      {/* Walk-in Modal */}
      <Modal open={walkinOpen} onClose={() => setWalkinOpen(false)} title="Walk-In Patient Check-In">
        <form onSubmit={handleWalkinSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-fg">Select Patient</label>
            <Select value={walkinPatientId} onChange={(e) => setWalkinPatientId(e.target.value)}>
              {patients.map((p) => (
                <option key={p.swasthyaId} value={p.swasthyaId}>
                  {p.name} ({p.swasthyaId} · {p.village})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Department</label>
              <Select value={walkinDept} onChange={(e) => setWalkinDept(e.target.value)}>
                <option>General Medicine</option>
                <option>Pediatrics</option>
                <option>Obstetrics &amp; Gynecology</option>
                <option>Orthopedics</option>
                <option>Emergency Triage</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Duty Doctor</label>
              <Select value={walkinDoc} onChange={(e) => setWalkinDoc(e.target.value)}>
                <option>Dr. Anita Rao</option>
                <option>Dr. Rajesh Kumar</option>
                <option>Dr. Priya Singh</option>
                <option>Dr. Suresh Verma</option>
                <option>Dr. Meenakshi Sundaram</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-fg">Reason for Visit</label>
            <Input
              placeholder="e.g. Acute pain / Fever"
              value={walkinReason}
              onChange={(e) => setWalkinReason(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Issue OPD Token &amp; Check In
          </Button>
        </form>
      </Modal>

      {/* Checked-In Token Pass Modal */}
      {selectedVisit && (
        <Modal
          open={!!selectedVisit}
          onClose={() => { setSelectedVisit(null); setIssuedToken(null); }}
          title="Hospital OPD Token &amp; Check-in Pass"
          className="max-w-md text-center"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/60 p-5 space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-800">OPD Queue Token</span>
              <p className="text-4xl font-black text-emerald-800 tracking-wider font-mono">
                {issuedToken || selectedVisit.tokenNumber || "A-024"}
              </p>
              <p className="text-xs font-semibold text-emerald-900">
                Department: {selectedVisit.department}
              </p>
              <p className="text-[11px] text-muted">
                Doctor: {selectedVisit.doctorName}
              </p>
            </div>

            <div className="rounded-xl border border-border p-3 text-left text-xs space-y-1 bg-surface">
              <div className="flex justify-between">
                <span className="text-muted">Patient:</span>
                <span className="font-bold text-fg">{selectedVisit.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Patient ID:</span>
                <span className="font-mono font-bold text-brand-700">{selectedVisit.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Visit Number:</span>
                <span className="font-mono text-fg">{selectedVisit.visitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Check-In Status:</span>
                <span className="font-bold text-emerald-700">{selectedVisit.status.replace(/_/g, " ")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                Print Token Slip
              </Button>
              <Button
                className="flex-1"
                onClick={() => { setSelectedVisit(null); setIssuedToken(null); }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
