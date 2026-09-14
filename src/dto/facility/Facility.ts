import type { FacilityType } from "@/dto/constants/FacilityType";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  village?: string;
  state?: string;
  address?: string;
  phone?: string;
  lat?: number;
  lon?: number;
  distanceKm?: number;
  availableBeds?: number;
  totalBeds?: number;
  bedCapacity?: number;
  occupiedBeds?: number;
  doctorsAvailable?: number;
  specialties: string[];
  hasEmergency?: boolean;
  queueSize?: number;
  openHours?: string;
}
