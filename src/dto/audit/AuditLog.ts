import type { UserRole } from "@/dto/constants/UserRole";

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  facilityId?: string;
  action:
    | "USER_LOGIN"
    | "PATIENT_REGISTERED"
    | "APPOINTMENT_BOOKED"
    | "QR_GENERATED"
    | "QR_SCANNED"
    | "PATIENT_CHECKED_IN"
    | "TOKEN_ASSIGNED"
    | "CONSULTATION_STARTED"
    | "CONSULTATION_SAVED"
    | "TESTS_ORDERED"
    | "SAMPLE_COLLECTED"
    | "TEST_RESULT_UPLOADED"
    | "PRESCRIPTION_CREATED"
    | "MEDICINE_SCANNED"
    | "MEDICINE_DISPENSED"
    | "INVENTORY_UPDATED"
    | "BILL_GENERATED"
    | "BILL_PRINTED"
    | "REFERRAL_CREATED";
  details: string;
  targetEntity?: "PATIENT" | "VISIT" | "PRESCRIPTION" | "TEST_ORDER" | "MEDICINE" | "BILL";
  targetId?: string;
}
