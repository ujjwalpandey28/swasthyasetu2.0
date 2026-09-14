import type { RiskLevel } from "@/dto/constants/RiskLevel";

export interface Patient {
  swasthyaId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  dob?: string;
  village: string;
  district: string;
  state?: string;
  bloodGroup: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  riskLevel: RiskLevel;
  allergies: string[];
  registeredAt: string;
  registeredVia?: "NORMAL" | "AYUSHMAN" | "ABHA";
  ayushmanCardNo?: string;
  abhaId?: string;
  homeFacilityId?: string;
  currentVisitId?: string;
}

