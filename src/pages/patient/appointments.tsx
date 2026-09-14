import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  QrCode as QrIcon,
  CheckCircle2,
  Printer,
  Download,
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { QRCode } from "@/components/shared/QRCode";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";

const departmentDoctors: Record<string, string[]> = {
  "General Medicine": ["Dr. Anita Rao", "Dr. S. Iyer", "Dr. Rajesh Kumar"],
  "Cardiology": ["Dr. Rajesh Kumar", "Dr. Suresh Verma"],
  "Pediatrics": ["Dr. Priya Singh"],
  "Obstetrics & Gynecology": ["Dr. Meenakshi Sundaram"],
  "Orthopedics": ["Dr. Suresh Verma"],
  "Emergency Triage": ["Dr. Anita Rao", "Duty Medical Officer"],
};

export function AppointmentsPage() {
  const user = useAuthStore((s) => s.user);
  const patients = useHospitalDB((s) => s.patients);
  const visits = useHospitalDB((s) => s.visits);
  const facilities = useHospitalDB((s) => s.facilities);
  const createVisit = useHospitalDB((s) => s.createVisit);

  const currentPatient = useMemo(() => {
    if (!user) return patients[0];
    return (
      patients.find((p) => p.name.toLowerCase() === user.name.toLowerCase() || p.swasthyaId === user.id) ||
      patients[0]
    );
  }, [user, patients]);

  const patientVisits = useMemo(() => {
    return visits.filter((v) => v.patientId === currentPatient.swasthyaId);
  }, [visits, currentPatient]);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmedVisit, setConfirmedVisit] = useState<HospitalVisit | null>(null);

  const [facilityId, setFacilityId] = useState(facilities[0]?.id || "phc-1");
  const [department, setDepartment] = useState("General Medicine");
  const [doctorName, setDoctorName] = useState("Dr. Anita Rao");
  const [appointmentDate, setAppointmentDate] = useState("2026-09-14");
  const [time, setTime] = useState("10:30");
  const [reason, setReason] = useState("Routine health checkup and vitals review");

  const handleFacilityChange = (facId: string) => {
    setFacilityId(facId);
    const fac = facilities.find((f) => f.id === facId);
    if (fac && fac.specialties.length > 0) {
      setDepartment(fac.specialties[0]);
      const docs = departmentDoctors[fac.specialties[0]] || ["Duty Medical Officer"];
      setDoctorName(docs[0]);
    }
  };

  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    const docs = departmentDoctors[dept] || ["Duty Medical Officer"];
    setDoctorName(docs[0]);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const newVisit = createVisit({
      patientId: currentPatient.swasthyaId,
      facilityId,
      doctorName,
      department,
      reason,
      appointmentDate,
    });

    setBookingOpen(false);
    setConfirmedVisit(newVisit);
  };

  return (
    <div>
      <PageHeader
        title="Appointments &amp; Visit QRs"
        subtitle="Book consultations and manage your hospital visit tokens"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
        actions={
          <Button onClick={() => setBookingOpen(true)}>
            <CalendarPlus className="h-4 w-4" /> Book New Appointment
          </Button>
        }
      />

      {/* Visits List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patientVisits.map((v) => (
          <Card key={v.id} className="flex flex-col justify-between border-border hover:border-brand-300 transition">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-fg">{v.department}</h3>
                  <p className="text-xs text-muted font-mono">{v.visitNumber}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    v.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : v.status === "CHECKED_IN"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {v.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-fg">
                <p className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-brand-600" />
                  <span className="font-semibold">{v.doctorName}</span>
                </p>
                <p className="flex items-center gap-1.5 text-muted">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{v.facilityName}</span>
                </p>
                <p className="flex items-center gap-1.5 text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                  {v.tokenNumber && (
                    <span className="ml-auto font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Token: {v.tokenNumber}
                    </span>
                  )}
                </p>
                {v.reason && <p className="text-xs text-muted mt-2 italic bg-brand-50/40 p-2 rounded-lg">"{v.reason}"</p>}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmedVisit(v)}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <QrIcon className="h-3.5 w-3.5 text-brand-700" /> View Visit QR
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Book Appointment Modal */}
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book Hospital Consultation">
        <form onSubmit={handleBook} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-fg">Select Healthcare Facility</label>
            <Select value={facilityId} onChange={(e) => handleFacilityChange(e.target.value)}>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type} · {f.district})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Department</label>
              <Select value={department} onChange={(e) => handleDepartmentChange(e.target.value)}>
                {Object.keys(departmentDoctors).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Assigned Doctor</label>
              <Select value={doctorName} onChange={(e) => setDoctorName(e.target.value)}>
                {(departmentDoctors[department] || ["Duty Medical Officer"]).map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Preferred Date</label>
              <Input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Preferred Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-fg">Reason for Consultation / Symptoms</label>
            <Input
              placeholder="e.g. Fever and body ache since 2 days"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800 border border-brand-200">
            ✓ Booking generates a <strong>Secure Hospital Visit QR Code</strong> that will be scanned at Reception, Consultation, Lab &amp; Pharmacy.
          </div>

          <Button type="submit" className="w-full mt-2">
            Confirm Appointment &amp; Generate Visit QR
          </Button>
        </form>
      </Modal>

      {/* Appointment Confirmed / Show QR Modal */}
      {confirmedVisit && (
        <Modal
          open={!!confirmedVisit}
          onClose={() => setConfirmedVisit(null)}
          title="Hospital Visit QR &amp; Appointment Pass"
          className="max-w-md text-center"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Appointment Active &amp; QR Generated</span>
            </div>

            {/* Scannable Quiet Zone QR */}
            <div className="mx-auto inline-flex flex-col items-center justify-center rounded-2xl border-2 border-brand-600 bg-white p-4 shadow-lg">
              <QRCode value={confirmedVisit.qrToken} size={160} />
              <p className="mt-2 font-mono text-xs font-bold text-brand-900 tracking-wider">
                {confirmedVisit.visitNumber}
              </p>
            </div>

            <div className="rounded-xl bg-brand-50/70 border border-brand-200 p-3 text-left space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Doctor:</span>
                <span className="font-bold text-fg">{confirmedVisit.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hospital:</span>
                <span className="font-semibold text-fg">{confirmedVisit.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Department:</span>
                <span className="font-semibold text-fg">{confirmedVisit.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Patient ID:</span>
                <span className="font-mono font-bold text-brand-700">{confirmedVisit.patientId}</span>
              </div>
              {confirmedVisit.tokenNumber && (
                <div className="flex justify-between border-t border-brand-200 pt-1">
                  <span className="text-muted">Queue Token:</span>
                  <span className="font-bold text-emerald-700">{confirmedVisit.tokenNumber}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" /> Print QR
              </Button>
              <Button variant="secondary" size="sm" onClick={() => alert("QR code image downloaded!")}>
                <Download className="h-3.5 w-3.5" /> Download QR
              </Button>
            </div>

            <Link to="/patient/my-qr" onClick={() => setConfirmedVisit(null)}>
              <Button className="w-full mt-1">
                Open Fullscreen "My QR" Page <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}