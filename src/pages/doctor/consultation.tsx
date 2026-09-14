import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  HeartPulse,
  Pill,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, TextArea } from "@/components/ui/Input";
import { RiskBadge } from "@/components/ui/Badge";
import { evaluateVitalsRisk } from "@/lib/risk-evaluation";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { RiskLevel } from "@/dto/constants/RiskLevel";
import type { HospitalVisit } from "@/dto/visit/HospitalVisit";
import type { Prescription } from "@/dto/prescription/Prescription";
import type { TestOrder } from "@/dto/diagnostics/TestOrder";

const commonTests = [
  { name: "CBC (Complete Blood Count)", category: "Hematology" as const, dept: "Pathology" },
  { name: "Fasting Blood Sugar (FBS)", category: "Biochemistry" as const, dept: "Biochemistry" },
  { name: "HbA1c Glycated Hemoglobin", category: "Biochemistry" as const, dept: "Biochemistry" },
  { name: "LFT (Liver Function Test)", category: "Biochemistry" as const, dept: "Biochemistry" },
  { name: "KFT / Renal Function Test", category: "Biochemistry" as const, dept: "Biochemistry" },
  { name: "Chest X-Ray (PA View)", category: "Imaging" as const, dept: "Radiology" },
  { name: "ECG (12-Lead Sinus)", category: "Imaging" as const, dept: "Cardiology" },
  { name: "Lipid Profile", category: "Biochemistry" as const, dept: "Biochemistry" },
];

export function DoctorConsultationPage() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const visits = useHospitalDB((s) => s.visits);
  const patients = useHospitalDB((s) => s.patients);
  const medicinesDB = useHospitalDB((s) => s.medicines);
  const saveConsultation = useHospitalDB((s) => s.saveConsultation);

  const visitId = searchParams.get("visitId");

  const activeVisit = useMemo(() => {
    if (visitId) return visits.find((v) => v.id === visitId || v.visitNumber === visitId);
    return visits.find((v) => v.status === "CHECKED_IN" || v.status === "IN_CONSULTATION") || visits[0];
  }, [visitId, visits]);

  const activePatient = useMemo(() => {
    if (!activeVisit) return patients[0];
    return patients.find((p) => p.swasthyaId === activeVisit.patientId) || patients[0];
  }, [activeVisit, patients]);

  // Vitals State
  const [bpSys, setBpSys] = useState(activeVisit?.vitals?.bloodPressureSys ? String(activeVisit.vitals.bloodPressureSys) : "152");
  const [bpDia, setBpDia] = useState(activeVisit?.vitals?.bloodPressureDia ? String(activeVisit.vitals.bloodPressureDia) : "96");
  const [heartRate, setHeartRate] = useState(activeVisit?.vitals?.heartRate ? String(activeVisit.vitals.heartRate) : "88");
  const [temperature, setTemperature] = useState(activeVisit?.vitals?.temperature ? String(activeVisit.vitals.temperature) : "36.8");
  const [glucose, setGlucose] = useState(activeVisit?.vitals?.glucose ? String(activeVisit.vitals.glucose) : "175");
  const [spo2, setSpo2] = useState(activeVisit?.vitals?.spo2 ? String(activeVisit.vitals.spo2) : "97");

  // Clinical Notes & Diagnosis
  const [chiefComplaint, setChiefComplaint] = useState(activeVisit?.chiefComplaint || activeVisit?.reason || "Recurring giddiness and headache");
  const [diagnosis, setDiagnosis] = useState(activeVisit?.diagnosis || "Essential Hypertension (Stage 2) & Type 2 Diabetes Mellitus");
  const [clinicalNotes, setClinicalNotes] = useState(
    activeVisit?.clinicalNotes || "Patient advised low sodium diet, regular hydration, and glucose monitoring. Review in 1 week."
  );

  // Prescription Items State
  const [prescribedMeds, setPrescribedMeds] = useState<
    Array<{
      name: string;
      generic?: string;
      strength?: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }>
  >([
    {
      name: "Paracetamol 500mg",
      generic: "Acetaminophen",
      strength: "500mg",
      dosage: "1-0-1",
      frequency: "Twice daily after meals",
      duration: "5 days",
      quantity: 10,
      instructions: "Take SOS for headache or pain",
    },
    {
      name: "Azithromycin 500mg",
      generic: "Azithromycin",
      strength: "500mg",
      dosage: "1-0-0",
      frequency: "Once daily before lunch",
      duration: "5 days",
      quantity: 5,
      instructions: "Complete antibiotic course",
    },
    {
      name: "Pantoprazole 40mg",
      generic: "Pantoprazole",
      strength: "40mg",
      dosage: "1-0-0",
      frequency: "Once daily 30 mins before breakfast",
      duration: "5 days",
      quantity: 5,
      instructions: "Antacid coverage",
    },
  ]);

  // Selected Tests State
  const [selectedTests, setSelectedTests] = useState<string[]>([
    "CBC (Complete Blood Count)",
    "Fasting Blood Sugar (FBS)",
  ]);

  // New med builder fields
  const [medSelect, setMedSelect] = useState(medicinesDB[0]?.name || "Paracetamol 500mg");
  const [dosageSelect, setDosageSelect] = useState("1-0-1");
  const [frequencySelect, setFrequencySelect] = useState("Twice daily after meals");
  const [durationSelect, setDurationSelect] = useState("5 days");
  const [qtyInput, setQtyInput] = useState("10");

  // Summary result state
  const [consultationResult, setConsultationResult] = useState<{
    visit: HospitalVisit;
    prescription?: Prescription;
    tests: TestOrder[];
  } | null>(null);

  const vitalsRisk = evaluateVitalsRisk({
    bloodPressureSys: Number(bpSys) || 120,
    bloodPressureDia: Number(bpDia) || 80,
    heartRate: Number(heartRate) || 75,
    temperature: Number(temperature) || 36.6,
    glucose: glucose ? Number(glucose) : undefined,
    spo2: Number(spo2) || 98,
  });

  const handleAddMedicine = () => {
    const matched = medicinesDB.find((m) => m.name === medSelect);
    setPrescribedMeds([
      ...prescribedMeds,
      {
        name: matched?.name || medSelect,
        generic: matched?.generic,
        strength: matched?.strength || "Standard",
        dosage: dosageSelect,
        frequency: frequencySelect,
        duration: durationSelect,
        quantity: Number(qtyInput) || 10,
        instructions: "Take as directed",
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescribedMeds(prescribedMeds.filter((_, idx) => idx !== index));
  };

  const handleToggleTest = (testName: string) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter((t) => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleSaveConsultation = () => {
    if (!activeVisit) return;

    const testsToOrder = selectedTests.map((tName) => {
      const found = commonTests.find((ct) => ct.name === tName);
      return {
        name: tName,
        category: found?.category || "Biochemistry",
        department: found?.dept || "Pathology",
        notes: `Routine diagnostic investigation for ${diagnosis}`,
      };
    });

    const result = saveConsultation({
      visitId: activeVisit.id,
      doctorName: user?.name || "Dr. Anita Rao",
      vitals: {
        bloodPressureSys: Number(bpSys) || 120,
        bloodPressureDia: Number(bpDia) || 80,
        heartRate: Number(heartRate) || 75,
        temperature: Number(temperature) || 36.6,
        glucose: glucose ? Number(glucose) : undefined,
        spo2: Number(spo2) || 98,
      },
      diagnosis,
      clinicalNotes,
      riskLevel: vitalsRisk.riskLevel as RiskLevel,
      medicines: prescribedMeds,
      tests: testsToOrder,
    });

    setConsultationResult(result);
  };

  if (consultationResult) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Consultation Saved &amp; Orders Dispatched"
          subtitle={`Visit ${consultationResult.visit.visitNumber} · ${consultationResult.visit.patientName}`}
        />

        <Card className="border-2 border-emerald-500 bg-emerald-50/40 p-6 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-fg">Consultation Completed Successfully</h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            Diagnostic test orders have been routed to the Pathology Lab and the E-Prescription has been sent to the Pharmacy.
          </p>

          <div className="rounded-2xl border border-emerald-200 bg-surface p-4 text-left space-y-3">
            <div className="flex justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted">Patient:</span>
              <span className="font-bold text-fg">{consultationResult.visit.patientName} ({consultationResult.visit.patientId})</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2 text-xs">
              <span className="text-muted">Assessed Risk:</span>
              <RiskBadge level={consultationResult.visit.riskLevel || "LOW"} />
            </div>
            {consultationResult.prescription && (
              <div className="border-b border-border pb-2 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-brand-800">
                  <span>Prescription Issued:</span>
                  <span className="font-mono">{consultationResult.prescription.id}</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-muted">
                  {consultationResult.prescription.items.map((m) => (
                    <p key={m.id}>• {m.medicineName} — {m.dosage} ({m.quantity} units)</p>
                  ))}
                </div>
              </div>
            )}
            {consultationResult.tests.length > 0 && (
              <div className="text-xs space-y-1">
                <div className="flex justify-between font-semibold text-blue-800">
                  <span>Diagnostic Tests Ordered:</span>
                  <span>{consultationResult.tests.length} tests</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-muted">
                  {consultationResult.tests.map((t) => (
                    <p key={t.id}>• {t.testName} (Token: {t.tokenNumber})</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link to="/doctor" className="flex-1">
              <Button className="w-full">
                Return to OPD Queue <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pharmacy" className="flex-1">
              <Button variant="secondary" className="w-full">
                Simulate Pharmacy Dispensing →
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!activeVisit) {
    return (
      <div className="text-center p-8">
        <CardTitle>No Active Patient Selected</CardTitle>
        <Link to="/doctor" className="mt-4 inline-block">
          <Button>Back to Queue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Patient Header Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/doctor" className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-fg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-fg">{activePatient.name}</h1>
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {activePatient.swasthyaId}
              </span>
              {activeVisit.tokenNumber && (
                <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Token: {activeVisit.tokenNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              {activePatient.age}y · {activePatient.gender} · Blood: <strong>{activePatient.bloodGroup}</strong> · Village: {activePatient.village}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePatient.allergies && activePatient.allergies.length > 0 && (
            <span className="rounded-full bg-red-100 border border-red-300 px-2.5 py-0.5 text-xs font-bold text-red-800">
              ⚠️ Allergies: {activePatient.allergies.join(", ")}
            </span>
          )}
          <RiskBadge level={vitalsRisk.riskLevel as RiskLevel} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Clinical Form */}
        <div className="space-y-5 lg:col-span-2">
          {/* 1. Vitals & Risk Evaluation */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HeartPulse className="h-4 w-4 text-red-600" />
                Vitals &amp; Real-Time Risk Score
              </CardTitle>
              <span className="text-xs font-semibold text-muted">
                Score: <strong>{vitalsRisk.score}</strong> ({vitalsRisk.riskLevel})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-fg">BP Systolic (mmHg)</label>
                <Input type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-fg">BP Diastolic (mmHg)</label>
                <Input type="number" value={bpDia} onChange={(e) => setBpDia(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-fg">Heart Rate (bpm)</label>
                <Input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-fg">Temp (°C)</label>
                <Input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-fg">Fasting Glucose (mg/dL)</label>
                <Input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-fg">SpO2 (%)</label>
                <Input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
              </div>
            </div>

            {vitalsRisk.flags.length > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Clinical Alerts:
                </p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                  {vitalsRisk.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* 2. Chief Complaint, Diagnosis & Notes */}
          <Card className="space-y-3">
            <CardTitle className="text-sm">Clinical Findings &amp; Diagnosis</CardTitle>
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Chief Complaint &amp; Symptoms</label>
              <Input
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Headache, dizziness, fever for 3 days"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Primary Clinical Diagnosis *</label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Hypertension Stage 2, Type 2 Diabetes"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Doctor's Clinical Notes &amp; Advice</label>
              <TextArea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Advise lifestyle modifications, precautions..."
              />
            </div>
          </Card>

          {/* 3. Prescribe Medicines */}
          <Card className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Pill className="h-4 w-4 text-pink-600" />
                Prescribe Medicines (Auto-Routes to Pharmacy)
              </CardTitle>
              <span className="text-xs font-semibold text-brand-700">
                {prescribedMeds.length} Items Prescribed
              </span>
            </div>

            {/* Existing Prescribed List */}
            <div className="space-y-2">
              {prescribedMeds.map((med, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-border bg-brand-50/30 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-fg">{med.name}</p>
                    <p className="text-muted">
                      Dosage: <strong>{med.dosage}</strong> ({med.frequency}) · Duration: <strong>{med.duration}</strong> · Qty: <strong>{med.quantity}</strong>
                    </p>
                    {med.instructions && <p className="text-[10px] text-brand-800 italic">{med.instructions}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Medicine Mini Form */}
            <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/20 p-3 space-y-2 text-xs">
              <div className="font-semibold text-brand-900">Add Medicine to Prescription:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted">Select Medicine</label>
                  <Select value={medSelect} onChange={(e) => setMedSelect(e.target.value)}>
                    {medicinesDB.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.generic})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted">Dosage Schedule</label>
                  <Select value={dosageSelect} onChange={(e) => setDosageSelect(e.target.value)}>
                    <option>1-0-1 (Morning &amp; Night)</option>
                    <option>1-0-0 (Morning only)</option>
                    <option>0-0-1 (Night only)</option>
                    <option>1-1-1 (Thrice daily)</option>
                    <option>1 tablet SOS</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted">Frequency</label>
                  <Input value={frequencySelect} onChange={(e) => setFrequencySelect(e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted">Duration</label>
                  <Input value={durationSelect} onChange={(e) => setDurationSelect(e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted">Total Quantity</label>
                  <Input type="number" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)} />
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={handleAddMedicine} className="w-full">
                <Plus className="h-3.5 w-3.5" /> Add to Prescription
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Col: Prescribe Tests & Submit */}
        <div className="space-y-5">
          {/* Diagnostic Tests Selector */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                Prescribe Diagnostic Tests
              </CardTitle>
              <span className="text-xs font-semibold text-blue-700">
                {selectedTests.length} Selected
              </span>
            </div>
            <p className="text-xs text-muted">
              Select tests to auto-generate Lab Orders for the pathology queue:
            </p>

            <div className="space-y-2">
              {commonTests.map((t) => {
                const isSelected = selectedTests.includes(t.name);
                return (
                  <label
                    key={t.name}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/60 font-semibold text-blue-900"
                        : "border-border bg-surface text-muted hover:border-blue-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTest(t.name)}
                      className="mt-0.5 h-4 w-4 rounded text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-fg">{t.name}</p>
                      <p className="text-[10px] text-muted font-normal">{t.dept} · {t.category}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Action Card */}
          <Card className="space-y-3 border-2 border-brand-500 bg-brand-50/40 p-4">
            <h3 className="font-bold text-sm text-fg">Complete Consultation</h3>
            <p className="text-xs text-muted">
              Saving will update the patient record, dispatch test orders to Pathology Lab, and send the prescription to Pharmacy.
            </p>
            <Button onClick={handleSaveConsultation} className="w-full bg-brand-700 hover:bg-brand-600 text-white font-bold">
              <ClipboardList className="h-4 w-4" /> Save Consultation &amp; Issue Orders
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
