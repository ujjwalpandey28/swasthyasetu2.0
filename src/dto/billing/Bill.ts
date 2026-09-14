export interface BillItem {
  id: string;
  name: string;
  category: "MEDICINE" | "DIAGNOSTIC" | "CONSULTATION" | "OTHER";
  quantity: number;
  batchNo?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Bill {
  id: string; // e.g. BILL-2026-00412
  billNumber: string;
  visitId: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
  facilityAddress?: string;
  prescriptionId?: string;
  transactionId?: string;
  date: string;
  pharmacistName?: string;
  doctorName?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMode: "CASH" | "UPI" | "AYUSHMAN_BHARAT_PMJAY" | "GOVT_FREE_SCHEME";
  status: "PAID" | "PENDING" | "WAIVED";
}
