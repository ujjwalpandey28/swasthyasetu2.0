export type PrescriptionStatus = "ISSUED" | "PARTIALLY_DISPENSED" | "DISPENSED" | "CANCELLED";

export interface PrescribedMedicine {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosage: string;      // e.g. "1 tablet" or "1-0-1"
  frequency: string;   // e.g. "Twice daily after meals"
  duration: string;    // e.g. "10 days"
  quantity: number;    // e.g. 10
  dispensedQty: number;
  instructions?: string;
  isDispensed: boolean;
}

export interface Prescription {
  id: string; // e.g. RX-2026-0812
  visitId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  date: string;
  diagnosis: string;
  status: PrescriptionStatus;
  items: PrescribedMedicine[];
  notes?: string;
  dispensedAt?: string;
  pharmacistName?: string;
}
