export interface DispensedItemRecord {
  medicineId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  barcodeScanned: string;
}

export interface MedicineTransaction {
  id: string; // e.g. TXN-MED-9941
  transactionId: string;
  visitId: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  pharmacistId: string;
  pharmacistName: string;
  facilityId: string;
  facilityName: string;
  timestamp: string;
  items: DispensedItemRecord[];
  totalAmount: number;
  billId: string;
  status: "COMPLETED" | "REVERSED";
}
