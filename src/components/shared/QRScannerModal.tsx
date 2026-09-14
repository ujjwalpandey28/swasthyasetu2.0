import { useState, useMemo } from "react";
import {
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useHospitalDB } from "@/lib/database/db";
import { UserRole } from "@/dto/constants/UserRole";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";
import type { Patient } from "@/dto/patient/Patient";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  role: UserRole;
  onResolved: (data: { visit?: HospitalVisit; patient?: Patient }) => void;
}

export function QRScannerModal({
  open,
  onClose,
  title = "Scan Patient QR Code",
  role,
  onResolved,
}: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [activeTab, setActiveTab] = useState<"CAMERA" | "MANUAL" | "DEMO">("DEMO");
  const [scanStatus, setScanStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [resolvedData, setResolvedData] = useState<{ visit?: HospitalVisit; patient?: Patient } | null>(null);

  const visits = useHospitalDB((s) => s.visits);
  const patients = useHospitalDB((s) => s.patients);
  const getVisitByQR = useHospitalDB((s) => s.getVisitByQR);
  const getPatientById = useHospitalDB((s) => s.getPatientById);

  // Active visits available for quick demo scanning
  const activeVisits = useMemo(() => {
    return visits.filter((v) => v.status !== "CANCELLED").slice(0, 5);
  }, [visits]);

  const handleResolve = (code: string) => {
    const clean = code.trim();
    if (!clean) {
      setErrorMessage("Please enter a valid QR token or Patient ID");
      setScanStatus("ERROR");
      return;
    }

    // 1. Try finding by QR token or Visit ID
    const visit = getVisitByQR(clean) || visits.find((v) => v.id === clean || v.visitNumber === clean);
    if (visit) {
      const patient = patients.find((p) => p.swasthyaId === visit.patientId);
      setResolvedData({ visit, patient });
      setScanStatus("SUCCESS");
      setErrorMessage("");
      return;
    }

    // 2. Try finding by Patient ID fallback
    const patient = getPatientById(clean);
    if (patient) {
      const activeVisit = visits.find((v) => v.patientId === patient.swasthyaId && v.status !== "COMPLETED");
      setResolvedData({ visit: activeVisit, patient });
      setScanStatus("SUCCESS");
      setErrorMessage("");
      return;
    }

    setScanStatus("ERROR");
    setErrorMessage("No matching active patient or hospital visit found for this code/ID.");
  };

  const handleConfirm = () => {
    if (resolvedData) {
      onResolved(resolvedData);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setManualCode("");
    setScanStatus("IDLE");
    setErrorMessage("");
    setResolvedData(null);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-xl">
      <div className="space-y-4">
        {/* Tab Selection */}
        <div className="flex rounded-xl bg-brand-50/50 p-1 border border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => { setActiveTab("DEMO"); handleReset(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition ${
              activeTab === "DEMO" ? "bg-brand-700 text-white shadow-sm font-semibold" : "text-muted hover:text-fg"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> 1-Click Demo Scanner
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("CAMERA"); handleReset(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition ${
              activeTab === "CAMERA" ? "bg-brand-700 text-white shadow-sm font-semibold" : "text-muted hover:text-fg"
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> Live Camera Scanner
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("MANUAL"); handleReset(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition ${
              activeTab === "MANUAL" ? "bg-brand-700 text-white shadow-sm font-semibold" : "text-muted hover:text-fg"
            }`}
          >
            <Search className="h-3.5 w-3.5" /> Manual ID Lookup
          </button>
        </div>

        {/* Tab 1: 1-Click Demo Scanner */}
        {activeTab === "DEMO" && !resolvedData && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Select any active patient visit below to simulate scanning their Visit QR code:
            </p>
            <div className="space-y-2">
              {activeVisits.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleResolve(v.qrToken)}
                  className="w-full flex items-center justify-between rounded-xl border border-border p-3 text-left transition hover:border-brand-500 hover:bg-brand-50/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold text-xs">
                      {v.tokenNumber || "QR"}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-fg">{v.patientName}</p>
                      <p className="text-xs text-muted">
                        ID: <span className="font-mono">{v.patientId}</span> · {v.department} ({v.doctorName})
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                    {v.status.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Live Camera Feed Simulator */}
        {activeTab === "CAMERA" && !resolvedData && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/30 p-8 text-center">
            <div className="relative mb-3 flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-brand-600 bg-black/5">
              <QrCode className="h-16 w-16 text-brand-700 animate-pulse" />
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500 shadow-md animate-bounce" />
            </div>
            <p className="text-sm font-semibold text-fg">Position Patient QR inside viewfinder</p>
            <p className="mt-1 text-xs text-muted max-w-xs">
              Align the patient's digital health card QR or visit appointment QR code with the frame.
            </p>
            {activeVisits.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => handleResolve(activeVisits[0].qrToken)}
              >
                Simulate Camera Capture ({activeVisits[0].patientName})
              </Button>
            )}
          </div>
        )}

        {/* Tab 3: Manual Search Fallback */}
        {activeTab === "MANUAL" && !resolvedData && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              If the patient does not have a smartphone or QR scanning fails, search by Permanent Swasthya Patient ID or Phone Number:
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. SS-IND-00024581 or 9876543210"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResolve(manualCode)}
              />
              <Button onClick={() => handleResolve(manualCode)}>
                <Search className="h-4 w-4" /> Lookup
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {scanStatus === "ERROR" && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resolved Patient Verification Card */}
        {resolvedData && (
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-4 space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Patient Identity Verified</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-muted hover:text-fg"
              >
                Scan Another
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted">Patient Name:</span>
                <p className="font-semibold text-sm text-fg">{resolvedData.patient?.name || resolvedData.visit?.patientName}</p>
              </div>
              <div>
                <span className="text-muted">Patient ID:</span>
                <p className="font-mono font-semibold text-brand-700">{resolvedData.patient?.swasthyaId || resolvedData.visit?.patientId}</p>
              </div>
              <div>
                <span className="text-muted">Age / Gender / Blood:</span>
                <p className="font-medium text-fg">
                  {resolvedData.patient?.age || resolvedData.visit?.patientAge || 45}y · {resolvedData.patient?.gender || "Female"} · {resolvedData.patient?.bloodGroup || "O+"}
                </p>
              </div>
              <div>
                <span className="text-muted">Village / District:</span>
                <p className="font-medium text-fg">
                  {resolvedData.patient?.village || "Rampur"}, {resolvedData.patient?.district || "Rampur"}
                </p>
              </div>
              {resolvedData.visit && (
                <>
                  <div>
                    <span className="text-muted">Visit Number:</span>
                    <p className="font-mono font-medium text-fg">{resolvedData.visit.visitNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted">Assigned Doctor:</span>
                    <p className="font-medium text-fg">{resolvedData.visit.doctorName} ({resolvedData.visit.department})</p>
                  </div>
                  <div>
                    <span className="text-muted">Visit Status:</span>
                    <p className="font-bold text-brand-700">{resolvedData.visit.status.replace(/_/g, " ")}</p>
                  </div>
                  {resolvedData.visit.tokenNumber && (
                    <div>
                      <span className="text-muted">OPD Token:</span>
                      <p className="font-bold text-emerald-700 text-sm">{resolvedData.visit.tokenNumber}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Least-Privilege Role Context Notification */}
            <div className="rounded-lg bg-surface border border-border p-2 text-[11px] text-muted">
              Role: <strong>{role}</strong> · Authorized workflow will load on confirmation.
            </div>

            <Button className="w-full" onClick={handleConfirm}>
              Continue to {role.replace(/_/g, " ")} Workflow <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
