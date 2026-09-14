import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/dto/constants/UserRole";
import { RiskLevel } from "@/dto/constants/RiskLevel";
import type { Patient } from "@/dto/patient/Patient";
import type { HospitalVisit, VisitStatus, Vitals } from "@/dto/visit/HospitalVisit";
import type { TestOrder, TestOrderStatus, TestResultItem } from "@/dto/diagnostics/TestOrder";
import type { Prescription } from "@/dto/prescription/Prescription";
import type { Medicine, MedicineBatch } from "@/dto/medicine/Medicine";
import type { MedicineTransaction, DispensedItemRecord } from "@/dto/medicine/MedicineTransaction";
import type { Bill } from "@/dto/billing/Bill";
import type { AuditLog } from "@/dto/audit/AuditLog";
import type { Facility } from "@/dto/facility/Facility";



import {
  initialPatients,
  initialFacilities,
  initialMedicines,
  initialVisits,
  initialTestOrders,
  initialPrescriptions,
  initialTransactions,
  initialBills,
  initialAuditLogs,
} from "./seedData";

interface DBState {
  patients: Patient[];
  visits: HospitalVisit[];
  testOrders: TestOrder[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  transactions: MedicineTransaction[];
  bills: Bill[];
  auditLogs: AuditLog[];
  facilities: Facility[];

  // Patient Actions
  registerPatient: (patient: Omit<Patient, "swasthyaId" | "registeredAt">) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  searchPatients: (query?: string) => Patient[];

  // Visit & QR Actions
  createVisit: (data: {
    patientId: string;
    facilityId: string;
    doctorName: string;
    department: string;
    reason?: string;
    appointmentDate?: string;
  }) => HospitalVisit;
  getVisitById: (id: string) => HospitalVisit | undefined;
  getVisitByQR: (qrToken: string) => HospitalVisit | undefined;
  getActiveVisitForPatient: (patientId: string) => HospitalVisit | undefined;
  checkInVisit: (visitId: string, actorName: string) => { visit: HospitalVisit; tokenNumber: string };
  updateVisitStatus: (visitId: string, status: VisitStatus) => void;

  // Doctor Actions
  saveConsultation: (params: {
    visitId: string;
    doctorName: string;
    vitals: Vitals;
    diagnosis: string;
    clinicalNotes?: string;
    riskLevel?: RiskLevel;
    medicines?: Array<{
      name: string;
      generic?: string;
      strength?: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }>;
    tests?: Array<{
      name: string;
      category?: "Hematology" | "Biochemistry" | "Imaging" | "Microbiology" | "General";
      department?: string;
      notes?: string;
    }>;
  }) => { visit: HospitalVisit; prescription?: Prescription; tests: TestOrder[] };

  // Lab Actions
  updateTestStatus: (
    testId: string,
    status: TestOrderStatus,
    details?: {
      labTechnician?: string;
      summary?: string;
      keyValues?: TestResultItem[];
    }
  ) => TestOrder;

  // Pharmacy Actions
  dispensePrescriptionMedicines: (params: {
    prescriptionId: string;
    pharmacistId: string;
    pharmacistName: string;
    dispensedItems: Array<{
      medicineId: string;
      batchNo: string;
      quantity: number;
      barcodeScanned: string;
    }>;
  }) => { transaction: MedicineTransaction; bill: Bill };

  restockMedicine: (medicineId: string, batchNo: string, addQty: number) => void;

  // Audit
  logAudit: (log: Omit<AuditLog, "id" | "timestamp">) => void;

  // Reset
  resetDatabase: () => void;
}

function generateSwasthyaId(count: number): string {
  const padded = String(count + 24580 + 1).padStart(8, "0");
  return `SS-IND-${padded}`;
}

function generateVisitNumber(count: number): string {
  const padded = String(count + 12985).padStart(8, "0");
  return `VST-${padded}`;
}

export const useHospitalDB = create<DBState>()(
  persist(
    (set, get) => ({
      patients: initialPatients,
      facilities: initialFacilities,
      medicines: initialMedicines,
      visits: initialVisits,
      testOrders: initialTestOrders,
      prescriptions: initialPrescriptions,
      transactions: initialTransactions,
      bills: initialBills,
      auditLogs: initialAuditLogs,

      registerPatient: (data) => {
        const state = get();
        const swasthyaId = generateSwasthyaId(state.patients.length);
        const newPatient: Patient = {
          ...data,
          swasthyaId,
          registeredAt: new Date().toISOString().split("T")[0],
        };

        const newAudit: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: "system",
          actorName: "Registration Desk",
          actorRole: UserRole.HOSPITAL_STAFF,
          action: "PATIENT_REGISTERED",
          details: `Registered ${newPatient.name} with ID ${swasthyaId} (Via: ${newPatient.registeredVia || "NORMAL"})`,
          targetEntity: "PATIENT",
          targetId: swasthyaId,
        };

        set((s) => ({
          patients: [newPatient, ...s.patients],
          auditLogs: [newAudit, ...s.auditLogs],
        }));

        return newPatient;
      },

      getPatientById: (id) => {
        const clean = id.trim().toUpperCase();
        return get().patients.find(
          (p) =>
            p.swasthyaId.toUpperCase() === clean ||
            p.phone?.includes(clean) ||
            p.ayushmanCardNo?.toUpperCase() === clean ||
            p.abhaId?.toUpperCase() === clean
        );
      },

      searchPatients: (query) => {
        const { patients } = get();
        if (!query || !query.trim()) return patients;
        const q = query.toLowerCase().trim();
        return patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.swasthyaId.toLowerCase().includes(q) ||
            p.village.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            (p.phone && p.phone.includes(q))
        );
      },

      createVisit: ({ patientId, facilityId, doctorName, department, reason, appointmentDate }) => {
        const state = get();
        const patient = state.patients.find((p) => p.swasthyaId === patientId) || state.patients[0];
        const facility = state.facilities.find((f) => f.id === facilityId) || state.facilities[0];
        const visitNumber = generateVisitNumber(state.visits.length);
        const visitId = `vst-${Date.now()}`;
        const qrToken = `SWASTHYASETU://VISIT/SS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const newVisit: HospitalVisit = {
          id: visitId,
          visitNumber,
          patientId: patient.swasthyaId,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          facilityId: facility.id,
          facilityName: facility.name,
          doctorName,
          department,
          status: "BOOKED",
          qrToken,
          reason: reason || "General consultation",
          createdAt: appointmentDate ? `${appointmentDate}T09:00:00Z` : new Date().toISOString(),
        };

        const newAudit: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: patient.swasthyaId,
          actorName: patient.name,
          actorRole: UserRole.PATIENT,
          facilityId: facility.id,
          action: "APPOINTMENT_BOOKED",
          details: `Booked appointment with ${doctorName} (${department}) at ${facility.name}. Visit ${visitNumber} created.`,
          targetEntity: "VISIT",
          targetId: visitId,
        };

        set((s) => ({
          visits: [newVisit, ...s.visits],
          auditLogs: [newAudit, ...s.auditLogs],
          patients: s.patients.map((p) =>
            p.swasthyaId === patient.swasthyaId ? { ...p, currentVisitId: visitId } : p
          ),
        }));

        return newVisit;
      },

      getVisitById: (id) => {
        return get().visits.find((v) => v.id === id || v.visitNumber === id);
      },

      getVisitByQR: (qrToken) => {
        const clean = qrToken.trim();
        return get().visits.find((v) => v.qrToken === clean || v.id === clean || v.visitNumber === clean);
      },

      getActiveVisitForPatient: (patientId) => {
        return get().visits.find(
          (v) =>
            v.patientId === patientId &&
            v.status !== "COMPLETED" &&
            v.status !== "CANCELLED"
        );
      },

      checkInVisit: (visitId, actorName) => {
        const state = get();
        const visit = state.visits.find((v) => v.id === visitId || v.visitNumber === visitId);
        if (!visit) throw new Error("Visit not found");

        const prefix = visit.department.includes("Obstetrics") || visit.department.includes("Gynecology") ? "B" : "A";
        const num = String(Math.floor(Math.random() * 80) + 1).padStart(3, "0");
        const tokenNumber = `${prefix}-${num}`;

        const updatedVisit: HospitalVisit = {
          ...visit,
          status: "CHECKED_IN",
          tokenNumber,
          checkedInAt: new Date().toISOString(),
        };

        const newAudit: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: "staff",
          actorName,
          actorRole: UserRole.HOSPITAL_STAFF,
          facilityId: visit.facilityId,
          action: "PATIENT_CHECKED_IN",
          details: `Checked in patient ${visit.patientName} (${visit.patientId}) for Visit ${visit.visitNumber}. Assigned OPD Token ${tokenNumber}.`,
          targetEntity: "VISIT",
          targetId: visit.id,
        };

        set((s) => ({
          visits: s.visits.map((v) => (v.id === visit.id ? updatedVisit : v)),
          auditLogs: [newAudit, ...s.auditLogs],
        }));

        return { visit: updatedVisit, tokenNumber };
      },

      updateVisitStatus: (visitId, status) => {
        set((s) => ({
          visits: s.visits.map((v) => (v.id === visitId ? { ...v, status } : v)),
        }));
      },

      saveConsultation: ({ visitId, doctorName, vitals, diagnosis, clinicalNotes, riskLevel, medicines, tests }) => {
        const state = get();
        const visit = state.visits.find((v) => v.id === visitId);
        if (!visit) throw new Error("Visit not found");

        // 1. Create Prescription if medicines provided
        let newPrescription: Prescription | undefined;
        if (medicines && medicines.length > 0) {
          const rxId = `RX-2026-${String(state.prescriptions.length + 813).padStart(4, "0")}`;
          newPrescription = {
            id: rxId,
            visitId: visit.id,
            patientId: visit.patientId,
            patientName: visit.patientName,
            doctorName,
            facilityId: visit.facilityId,
            facilityName: visit.facilityName,
            date: new Date().toISOString().split("T")[0],
            diagnosis,
            status: "ISSUED",
            items: medicines.map((m, idx) => {
              const matchedMed = state.medicines.find(
                (med) => med.name.toLowerCase().includes(m.name.toLowerCase()) || med.generic.toLowerCase().includes(m.name.toLowerCase())
              );
              return {
                id: `rxi-${Date.now()}-${idx}`,
                medicineId: matchedMed?.id || `med-custom-${idx}`,
                medicineName: m.name,
                genericName: m.generic || matchedMed?.generic || m.name,
                strength: m.strength || matchedMed?.strength || "Standard",
                dosage: m.dosage,
                frequency: m.frequency,
                duration: m.duration,
                quantity: m.quantity || 10,
                dispensedQty: 0,
                isDispensed: false,
                instructions: m.instructions,
              };
            }),
            notes: clinicalNotes,
          };
        }

        // 2. Create Test Orders if tests provided
        const newTestOrders: TestOrder[] = [];
        if (tests && tests.length > 0) {
          tests.forEach((t, idx) => {
            const testId = `TST-${String(state.testOrders.length + idx + 93).padStart(4, "0")}`;
            const tokenNumber = `LAB-${String(state.testOrders.length + idx + 16).padStart(3, "0")}`;
            newTestOrders.push({
              id: testId,
              visitId: visit.id,
              patientId: visit.patientId,
              patientName: visit.patientName,
              facilityId: visit.facilityId,
              facilityName: visit.facilityName,
              doctorName,
              testName: t.name,
              category: t.category || "Biochemistry",
              department: t.department || "Pathology",
              tokenNumber,
              status: "ORDERED",
              clinicalNotes: t.notes,
              orderedAt: new Date().toISOString(),
            });
          });
        }

        // 3. Update visit
        const updatedVisit: HospitalVisit = {
          ...visit,
          status: tests && tests.length > 0 ? "TESTS_PENDING" : medicines && medicines.length > 0 ? "PHARMACY_PENDING" : "COMPLETED",
          doctorName,
          vitals,
          diagnosis,
          clinicalNotes,
          riskLevel: riskLevel || RiskLevel.LOW,
          prescriptionsCount: newPrescription ? 1 : 0,
          testsCount: newTestOrders.length,
          consultedAt: new Date().toISOString(),
        };

        const newAudits: AuditLog[] = [
          {
            id: `log-${Date.now()}-c`,
            timestamp: new Date().toISOString(),
            actorId: "doc",
            actorName: doctorName,
            actorRole: UserRole.DOCTOR,
            facilityId: visit.facilityId,
            action: "CONSULTATION_SAVED",
            details: `Completed consultation for ${visit.patientName}. Diagnosis: ${diagnosis}.`,
            targetEntity: "VISIT",
            targetId: visit.id,
          },
        ];

        if (newPrescription) {
          newAudits.push({
            id: `log-${Date.now()}-rx`,
            timestamp: new Date().toISOString(),
            actorId: "doc",
            actorName: doctorName,
            actorRole: UserRole.DOCTOR,
            facilityId: visit.facilityId,
            action: "PRESCRIPTION_CREATED",
            details: `Issued Prescription ${newPrescription.id} with ${newPrescription.items.length} medicines.`,
            targetEntity: "PRESCRIPTION",
            targetId: newPrescription.id,
          });
        }

        if (newTestOrders.length > 0) {
          newAudits.push({
            id: `log-${Date.now()}-t`,
            timestamp: new Date().toISOString(),
            actorId: "doc",
            actorName: doctorName,
            actorRole: UserRole.DOCTOR,
            facilityId: visit.facilityId,
            action: "TESTS_ORDERED",
            details: `Ordered tests: ${newTestOrders.map((t) => t.testName).join(", ")}.`,
            targetEntity: "TEST_ORDER",
            targetId: newTestOrders[0].id,
          });
        }

        set((s) => ({
          visits: s.visits.map((v) => (v.id === visit.id ? updatedVisit : v)),
          prescriptions: newPrescription ? [newPrescription, ...s.prescriptions] : s.prescriptions,
          testOrders: [...newTestOrders, ...s.testOrders],
          auditLogs: [...newAudits, ...s.auditLogs],
          patients: s.patients.map((p) =>
            p.swasthyaId === visit.patientId && riskLevel ? { ...p, riskLevel } : p
          ),
        }));

        return { visit: updatedVisit, prescription: newPrescription, tests: newTestOrders };
      },

      updateTestStatus: (testId, status, details) => {
        const state = get();
        const test = state.testOrders.find((t) => t.id === testId);
        if (!test) throw new Error("Test not found");

        const updatedTest: TestOrder = {
          ...test,
          status,
          sampleCollectedAt: status === "SAMPLE_COLLECTED" ? new Date().toISOString() : test.sampleCollectedAt,
          completedAt: status === "COMPLETED" ? new Date().toISOString() : test.completedAt,
          labTechnician: details?.labTechnician || test.labTechnician,
          summary: details?.summary || test.summary,
          keyValues: details?.keyValues || test.keyValues,
        };

        const newAudit: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: "lab",
          actorName: details?.labTechnician || "Lab Technician",
          actorRole: UserRole.LAB,
          facilityId: test.facilityId,
          action: status === "COMPLETED" ? "TEST_RESULT_UPLOADED" : "SAMPLE_COLLECTED",
          details: `Test ${test.testName} for ${test.patientName} marked as ${status}.`,
          targetEntity: "TEST_ORDER",
          targetId: test.id,
        };

        // Check if all tests for this visit are completed
        const otherTests = state.testOrders.filter((t) => t.visitId === test.visitId && t.id !== test.id);
        const allTestsCompleted = status === "COMPLETED" && otherTests.every((t) => t.status === "COMPLETED");

        set((s) => ({
          testOrders: s.testOrders.map((t) => (t.id === test.id ? updatedTest : t)),
          auditLogs: [newAudit, ...s.auditLogs],
          visits: s.visits.map((v) => {
            if (v.id === test.visitId && allTestsCompleted) {
              const hasRx = s.prescriptions.some((rx) => rx.visitId === test.visitId && rx.status !== "DISPENSED");
              return {
                ...v,
                status: hasRx ? "PHARMACY_PENDING" : "COMPLETED",
              };
            }
            return v;
          }),
        }));

        return updatedTest;
      },

      dispensePrescriptionMedicines: ({ prescriptionId, pharmacistId, pharmacistName, dispensedItems }) => {
        const state = get();
        const prescription = state.prescriptions.find((p) => p.id === prescriptionId);
        if (!prescription) throw new Error("Prescription not found");

        const facility = state.facilities.find((f) => f.id === prescription.facilityId) || state.facilities[0];

        // 1. Process dispensed items, update stock atomically
        const updatedMedicines = [...state.medicines];
        const recordItems: DispensedItemRecord[] = [];
        const billItems = [];
        let totalBillAmount = 0;

        for (const item of dispensedItems) {
          const medIndex = updatedMedicines.findIndex((m) => m.id === item.medicineId);
          if (medIndex !== -1) {
            const med = { ...updatedMedicines[medIndex] };
            const batchIndex = med.batches.findIndex((b: MedicineBatch) => b.batchNo === item.batchNo);
            let unitPrice = med.mrp || 2.5;


            if (batchIndex !== -1) {
              const batch = { ...med.batches[batchIndex] };
              unitPrice = batch.mrp || unitPrice;
              batch.stockQty = Math.max(0, batch.stockQty - item.quantity);
              med.batches = [...med.batches];
              med.batches[batchIndex] = batch;
            }

            med.stockQty = Math.max(0, med.stockQty - item.quantity);
            med.availability = med.stockQty === 0 ? "OUT_OF_STOCK" : med.stockQty <= med.reorderLevel ? "LOW_STOCK" : "IN_STOCK";
            updatedMedicines[medIndex] = med;

            const lineTotal = unitPrice * item.quantity;
            totalBillAmount += lineTotal;

            recordItems.push({
              medicineId: med.id,
              medicineName: med.name,
              genericName: med.generic,
              strength: med.strength,
              batchNo: item.batchNo,
              expiryDate: med.batches[batchIndex]?.expiryDate || "2027-12-31",
              quantity: item.quantity,
              unitPrice,
              totalPrice: lineTotal,
              barcodeScanned: item.barcodeScanned,
            });

            billItems.push({
              id: `bi-${Date.now()}-${item.medicineId}`,
              name: `${med.name} (${item.quantity} ${med.unit}s)`,
              category: "MEDICINE" as const,
              quantity: item.quantity,
              batchNo: item.batchNo,
              unitPrice,
              totalPrice: lineTotal,
            });
          }
        }

        // 2. Generate Transaction
        const txnId = `TXN-MED-${Date.now().toString().slice(-4)}`;
        const billId = `BILL-2026-${String(state.bills.length + 413).padStart(5, "0")}`;

        const transaction: MedicineTransaction = {
          id: txnId,
          transactionId: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(state.transactions.length + 1).padStart(4, "0")}`,
          visitId: prescription.visitId,
          prescriptionId: prescription.id,
          patientId: prescription.patientId,
          patientName: prescription.patientName,
          doctorName: prescription.doctorName,
          pharmacistId,
          pharmacistName,
          facilityId: prescription.facilityId,
          facilityName: prescription.facilityName,
          timestamp: new Date().toISOString(),
          items: recordItems,
          totalAmount: totalBillAmount,
          billId,
          status: "COMPLETED",
        };

        // 3. Generate Bill
        const bill: Bill = {
          id: billId,
          billNumber: `INV-SS-${new Date().getFullYear()}-${String(state.bills.length + 413).padStart(5, "0")}`,
          visitId: prescription.visitId,
          patientId: prescription.patientId,
          patientName: prescription.patientName,
          facilityId: prescription.facilityId,
          facilityName: prescription.facilityName,
          facilityAddress: facility.address,
          prescriptionId: prescription.id,
          transactionId: transaction.transactionId,
          date: new Date().toISOString().split("T")[0],
          pharmacistName,
          doctorName: prescription.doctorName,
          items: billItems,
          subtotal: totalBillAmount,
          discount: totalBillAmount, // 100% Subsidized / Free Govt Rural Scheme
          totalAmount: 0.0,
          paymentMode: "GOVT_FREE_SCHEME",
          status: "PAID",
        };

        // 4. Update Prescription Status
        const updatedPrescription: Prescription = {
          ...prescription,
          status: "DISPENSED",
          dispensedAt: new Date().toISOString(),
          pharmacistName,
          items: prescription.items.map((item) => {
            const found = dispensedItems.find((d) => d.medicineId === item.medicineId);
            return found ? { ...item, dispensedQty: found.quantity, isDispensed: true } : item;
          }),
        };

        // 5. Audit Log
        const newAudit: AuditLog = {
          id: `log-${Date.now()}-pharm`,
          timestamp: new Date().toISOString(),
          actorId: pharmacistId,
          actorName: pharmacistName,
          actorRole: UserRole.PHARMACY,
          facilityId: prescription.facilityId,
          action: "MEDICINE_DISPENSED",
          details: `Dispensed ${recordItems.length} prescribed medicines for ${prescription.patientName}. Generated Bill ${bill.billNumber}.`,
          targetEntity: "PRESCRIPTION",
          targetId: prescription.id,
        };

        set((s) => ({
          medicines: updatedMedicines,
          prescriptions: s.prescriptions.map((p) => (p.id === prescription.id ? updatedPrescription : p)),
          transactions: [transaction, ...s.transactions],
          bills: [bill, ...s.bills],
          auditLogs: [newAudit, ...s.auditLogs],
          visits: s.visits.map((v) =>
            v.id === prescription.visitId
              ? {
                  ...v,
                  status: "COMPLETED",
                  completedAt: new Date().toISOString(),
                }
              : v
          ),
        }));

        return { transaction, bill };
      },

      restockMedicine: (medicineId, batchNo, addQty) => {
        set((s) => ({
          medicines: s.medicines.map((m) => {
            if (m.id === medicineId) {
              const batchIdx = m.batches.findIndex((b) => b.batchNo === batchNo);
              let updatedBatches = [...m.batches];
              if (batchIdx !== -1) {
                updatedBatches[batchIdx] = {
                  ...updatedBatches[batchIdx],
                  stockQty: updatedBatches[batchIdx].stockQty + addQty,
                };
              } else {
                updatedBatches.push({
                  batchNo,
                  expiryDate: "2028-06-30",
                  stockQty: addQty,
                  mrp: m.mrp,
                });
              }
              const newTotal = m.stockQty + addQty;
              return {
                ...m,
                stockQty: newTotal,
                batches: updatedBatches,
                availability: newTotal > m.reorderLevel ? "IN_STOCK" : newTotal > 0 ? "LOW_STOCK" : "OUT_OF_STOCK",
              };
            }
            return m;
          }),
        }));
      },

      logAudit: (log) => {
        const newAudit: AuditLog = {
          ...log,
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          auditLogs: [newAudit, ...s.auditLogs],
        }));
      },

      resetDatabase: () => {
        set({
          patients: initialPatients,
          facilities: initialFacilities,
          medicines: initialMedicines,
          visits: initialVisits,
          testOrders: initialTestOrders,
          prescriptions: initialPrescriptions,
          transactions: initialTransactions,
          bills: initialBills,
          auditLogs: initialAuditLogs,
        });
      },
    }),
    { name: "swasthya-db-v2" }
  )
);
