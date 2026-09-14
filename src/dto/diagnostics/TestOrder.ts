export type TestOrderStatus =
  | "ORDERED"
  | "SAMPLE_COLLECTED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export interface TestResultItem {
  label: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  flag?: "NORMAL" | "ABNORMAL" | "CRITICAL";
}

export interface TestOrder {
  id: string; // e.g. TST-0091
  visitId: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
  doctorName: string;
  testName: string; // e.g. CBC, LFT, Fasting Blood Sugar, X-Ray Chest
  category: "Hematology" | "Biochemistry" | "Imaging" | "Microbiology" | "General";
  department: string;
  tokenNumber?: string;
  status: TestOrderStatus;
  clinicalNotes?: string;
  orderedAt: string;
  sampleCollectedAt?: string;
  completedAt?: string;
  labTechnician?: string;
  summary?: string;
  keyValues?: TestResultItem[];
  reportFileUrl?: string;
}
