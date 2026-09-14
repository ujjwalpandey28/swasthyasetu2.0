import type { RiskLevel } from "@/dto/constants/RiskLevel";

export type VisitStatus =
  | "BOOKED"
  | "CHECKED_IN"
  | "WAITING_FOR_DOCTOR"
  | "IN_CONSULTATION"
  | "TESTS_PENDING"
  | "TESTS_COMPLETED"
  | "PHARMACY_PENDING"
  | "MEDICINES_DISPENSED"
  | "COMPLETED"
  | "CANCELLED";

export interface Vitals {
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  temperature: number;
  glucose?: number;
  spo2: number;
  weightKg?: number;
  heightCm?: number;
}

export interface HospitalVisit {
  id: string;
  visitNumber: string; // e.g. VST-00012984
  patientId: string;   // Permanent Swasthya ID e.g. SS-IND-00024581
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  appointmentId?: string;
  facilityId: string;
  facilityName: string;
  doctorName: string;
  department: string;
  tokenNumber?: string; // e.g. A-024
  status: VisitStatus;
  qrToken: string;      // Opaque token e.g. SWASTHYASETU://VISIT/TOKEN_HASH
  reason?: string;
  symptoms?: string[];
  chiefComplaint?: string;
  vitals?: Vitals;
  diagnosis?: string;
  clinicalNotes?: string;
  riskLevel?: RiskLevel;
  prescriptionsCount?: number;
  testsCount?: number;
  createdAt: string;
  checkedInAt?: string;
  consultedAt?: string;
  completedAt?: string;
}
