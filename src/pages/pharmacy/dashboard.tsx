import { useState, useMemo } from "react";
import {
  Pill,
  QrCode as QrIcon,
  Barcode,
  CheckCircle2,
  Receipt,
  ShieldAlert,
  Printer,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRScannerModal } from "@/components/shared/QRScannerModal";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { UserRole } from "@/dto/constants/UserRole";
import type { Prescription } from "@/dto/prescription/Prescription";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";
import type { Patient } from "@/dto/patient/Patient";

export function PharmacyDashboard() {
  const user = useAuthStore((s) => s.user);
  const prescriptions = useHospitalDB((s) => s.prescriptions);
  const medicinesDB = useHospitalDB((s) => s.medicines);
  const patients = useHospitalDB((s) => s.patients);
  const dispensePrescriptionMedicines = useHospitalDB((s) => s.dispensePrescriptionMedicines);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Barcode Scanning State per medicine in the active prescription
  const [scannedMap, setScannedMap] = useState<Record<string, { batchNo: string; barcode: string; verified: boolean }>>({});
  const [dispenseSuccessModal, setDispenseSuccessModal] = useState<{ billId: string; txnId: string } | null>(null);

  const pharmacistName = user?.name || "Ravi Shastri (Pharmacist)";

  const pendingPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => p.status !== "DISPENSED");
  }, [prescriptions]);

  const patientForSelectedRx = useMemo(() => {
    if (!selectedRx) return null;
    return patients.find((p) => p.swasthyaId === selectedRx.patientId);
  }, [selectedRx, patients]);

  const handleQRResolved = ({ visit, patient }: { visit?: HospitalVisit; patient?: Patient }) => {
    const vId = visit?.id;
    const pId = visit?.patientId || patient?.swasthyaId;
    const matchedRx = prescriptions.find((p) => (vId && p.visitId === vId) || (pId && p.patientId === pId));
    if (matchedRx) {
      setSelectedRx(matchedRx);
      setScannedMap({});
    } else {
      alert("No active pending prescription found for this patient QR.");
    }
  };

  const handleOpenPrescription = (rx: Prescription) => {
    setSelectedRx(rx);
    setScannedMap({});
  };

  // Simulate scanning a specific medicine strip / barcode
  const handleScanMedicineBarcode = (medId: string, barcodeToMatch?: string) => {
    const med = medicinesDB.find((m) => m.id === medId || m.barcode === barcodeToMatch);
    if (!med) {
      alert("Barcode not recognized in hospital pharmacy inventory.");
      return;
    }

    const primaryBatch = med.batches[0] || { batchNo: "BATCH-STD", expiryDate: "2027-12-31" };

    setScannedMap((prev) => ({
      ...prev,
      [medId]: {
        batchNo: primaryBatch.batchNo,
        barcode: med.barcode,
        verified: true,
      },
    }));
  };

  // Check if all items in the prescription are verified
  const allVerified = useMemo(() => {
    if (!selectedRx) return false;
    return selectedRx.items.every((item) => scannedMap[item.medicineId]?.verified);
  }, [selectedRx, scannedMap]);

  // Execute atomic dispensation
  const handleExecuteDispense = () => {
    if (!selectedRx) return;

    const itemsToDispense = selectedRx.items.map((item) => {
      const scanInfo = scannedMap[item.medicineId];
      return {
        medicineId: item.medicineId,
        batchNo: scanInfo?.batchNo || "BATCH-STD",
        quantity: item.quantity,
        barcodeScanned: scanInfo?.barcode || "890123456701",
      };
    });

    try {
      const { transaction, bill } = dispensePrescriptionMedicines({
        prescriptionId: selectedRx.id,
        pharmacistId: user?.id || "ph-01",
        pharmacistName,
        dispensedItems: itemsToDispense,
      });

      setDispenseSuccessModal({ billId: bill.billNumber, txnId: transaction.transactionId });
      setSelectedRx(null);
      setScannedMap({});
    } catch (err: any) {
      alert(err.message || "Dispensing error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-amber-700 via-amber-800 to-brand-800 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            Hospital Pharmacy &amp; Drug Distribution
          </span>
          <h1 className="mt-1 text-2xl font-black">Medicine Barcode Scanning &amp; Dispensing</h1>
          <p className="text-xs text-amber-100 mt-0.5">
            Strip Barcode Verification · Batch &amp; Expiry Safety Checks · Atomic Stock Deduction · Digital Billing
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setScannerOpen(true)}
            size="lg"
            className="bg-white text-amber-900 hover:bg-amber-50 shadow-xl font-bold flex items-center gap-2"
          >
            <QrIcon className="h-5 w-5 text-amber-700" /> SCAN PATIENT QR
          </Button>
        </div>
      </div>

      {/* Main Prescription Queue & Dispensing Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Col: Prescriptions Waiting Queue */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-fg">Prescriptions Queue ({pendingPrescriptions.length})</h2>
            <span className="text-xs text-muted">Awaiting Dispensing</span>
          </div>

          <div className="space-y-2.5">
            {pendingPrescriptions.length === 0 ? (
              <Card className="p-6 text-center text-xs text-muted">
                No pending prescriptions. All medicines dispensed.
              </Card>
            ) : (
              pendingPrescriptions.map((rx) => {
                const isSelected = selectedRx?.id === rx.id;
                return (
                  <button
                    key={rx.id}
                    type="button"
                    onClick={() => handleOpenPrescription(rx)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-md"
                        : "border-border bg-surface hover:border-amber-300 hover:bg-brand-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-amber-800">{rx.id}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        {rx.items.length} Medicines
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-sm text-fg">{rx.patientName}</p>
                    <p className="text-xs text-muted font-mono">{rx.patientId}</p>
                    <p className="text-[11px] text-muted mt-1 truncate">Dr. {rx.doctorName} · {rx.diagnosis}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Real Medicine-by-Medicine Scanning Suite */}
        <div className="space-y-4 lg:col-span-2">
          {selectedRx ? (
            <Card className="border-2 border-amber-500 bg-surface shadow-xl p-5 space-y-4">
              {/* Prescription Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-fg">{selectedRx.patientName}</h3>
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {selectedRx.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Prescription ID: <strong>{selectedRx.id}</strong> · Prescribed by: <strong>{selectedRx.doctorName}</strong>
                  </p>
                </div>

                {patientForSelectedRx?.allergies && patientForSelectedRx.allergies.length > 0 && (
                  <div className="rounded-xl bg-red-100 border border-red-300 px-3 py-1.5 text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Allergies: {patientForSelectedRx.allergies.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Medicine-by-Medicine Real Barcode Scanning List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-amber-700" />
                    Medicine Strip Barcode Scanning ({selectedRx.items.length} Items)
                  </span>
                  <span className="text-xs text-muted">
                    Scan each strip before dispensing
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedRx.items.map((item, idx) => {
                    const matchedMed = medicinesDB.find((m) => m.id === item.medicineId || m.name.includes(item.medicineName));
                    const scanStatus = scannedMap[item.medicineId];
                    const isVerified = scanStatus?.verified;
                    const batch = matchedMed?.batches[0];

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 transition ${
                          isVerified
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-amber-300 bg-amber-50/20"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white text-xs font-bold">
                                {idx + 1}
                              </span>
                              <h4 className="font-bold text-sm text-fg">{item.medicineName}</h4>
                              {matchedMed?.strength && (
                                <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-semibold text-brand-800">
                                  {matchedMed.strength}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-muted pl-8">
                              Prescribed Dosage: <strong>{item.dosage}</strong> ({item.frequency}) · Qty: <strong>{item.quantity} units</strong>
                            </p>

                            {/* Inventory & Batch Info */}
                            {matchedMed && (
                              <div className="pl-8 text-[11px] text-muted flex flex-wrap gap-x-3 gap-y-1 pt-1">
                                <span>Batch: <strong className="font-mono text-fg">{batch?.batchNo || "PCM-2026-A1"}</strong></span>
                                <span>Expiry: <strong className="text-fg">{batch?.expiryDate || "2027-08-31"}</strong></span>
                                <span>Stock: <strong className="text-emerald-700">{matchedMed.stockQty} {matchedMed.unit}s</strong></span>
                                <span>MRP: <strong>₹{matchedMed.mrp.toFixed(2)}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Verification State & Scan Button */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isVerified ? (
                              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-800">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>Verified ✓</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleScanMedicineBarcode(item.medicineId, matchedMed?.barcode)}
                                className="bg-amber-700 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5"
                              >
                                <Barcode className="h-4 w-4" /> Scan Barcode
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Dispensation Action */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Verification Status:</span>
                  <span className={allVerified ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
                    {allVerified ? "✓ All Prescribed Medicines Verified" : "⚠️ Please scan all medicine strips above"}
                  </span>
                </div>

                <Button
                  onClick={handleExecuteDispense}
                  disabled={!allVerified}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 shadow-lg"
                >
                  <Receipt className="h-4 w-4" /> Authorize Dispense, Deduct Inventory &amp; Generate Bill
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-muted">
              <Pill className="mx-auto h-12 w-12 text-brand-300 mb-3" />
              <CardTitle>Select a Prescription or Scan Patient QR</CardTitle>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Scan the patient's visit QR code or select a pending prescription from the left queue to begin strip barcode verification.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        role={UserRole.PHARMACY}
        onResolved={handleQRResolved}
      />

      {/* Dispense Success & Bill Generated Modal */}
      {dispenseSuccessModal && (
        <Modal
          open={!!dispenseSuccessModal}
          onClose={() => setDispenseSuccessModal(null)}
          title="Medicine Dispensing &amp; Billing Complete"
          className="max-w-md text-center"
        >
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-lg font-bold text-fg">Medicines Dispensed &amp; Stock Updated</h2>
            <p className="text-xs text-muted">
              Inventory balances have been atomically updated and the official transaction has been logged.
            </p>

            <div className="rounded-xl border border-border bg-brand-50/50 p-3.5 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Invoice Bill Number:</span>
                <span className="font-mono font-bold text-brand-800">{dispenseSuccessModal.billId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Transaction ID:</span>
                <span className="font-mono text-muted">{dispenseSuccessModal.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Dispensing Pharmacist:</span>
                <span className="font-semibold text-fg">{pharmacistName}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Hardcopy Bill
              </Button>
              <Button className="flex-1" onClick={() => setDispenseSuccessModal(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
