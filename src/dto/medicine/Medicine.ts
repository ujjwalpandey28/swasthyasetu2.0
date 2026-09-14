export interface MedicineBatch {
  batchNo: string;
  expiryDate: string; // YYYY-MM-DD
  stockQty: number;
  mrp: number;
  manufacturer?: string;
  isRecalled?: boolean;
}

export interface Medicine {
  id: string; // e.g. med-1
  barcode: string; // e.g. 890123456701
  name: string;
  generic: string;
  strength: string; // e.g. 500mg
  category: string;
  facilityId: string;
  stockQty: number;
  reorderLevel: number;
  unit: string; // tablet, sachet, vial, syrup
  mrp: number;
  batches: MedicineBatch[];
  availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}
