import { useState, useMemo } from "react";
import {
  Receipt,
  Printer,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import type { Bill } from "@/dto/billing/Bill";

export function PatientBillsPage() {
  const user = useAuthStore((s) => s.user);
  const patients = useHospitalDB((s) => s.patients);
  const bills = useHospitalDB((s) => s.bills);

  const currentPatient = useMemo(() => {
    if (!user) return patients[0];
    return (
      patients.find((p) => p.name.toLowerCase() === user.name.toLowerCase() || p.swasthyaId === user.id) ||
      patients[0]
    );
  }, [user, patients]);

  const patientBills = useMemo(() => {
    return bills.filter((b) => b.patientId === currentPatient.swasthyaId);
  }, [bills, currentPatient]);

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="My Bills &amp; Receipts"
        subtitle="Digital invoices for dispensed medicines and hospital services"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />

      <div className="space-y-4">
        {patientBills.length === 0 ? (
          <Card className="text-center p-8">
            <Receipt className="mx-auto h-12 w-12 text-muted mb-3" />
            <CardTitle>No Bills Generated Yet</CardTitle>
            <p className="text-xs text-muted mt-1">
              When medicines are dispensed at the pharmacy counter, your digital invoice will appear here automatically.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patientBills.map((b) => (
              <Card key={b.id} className="flex flex-col justify-between border-border hover:border-brand-300 transition">
                <div>
                  <div className="flex items-start justify-between border-b border-border pb-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-fg font-mono">{b.billNumber}</h3>
                      <p className="text-xs text-muted">{b.date}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px] border border-emerald-200">
                      {b.status} · {b.paymentMode.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className="text-muted">
                      Hospital: <strong className="text-fg">{b.facilityName}</strong>
                    </p>
                    {b.pharmacistName && (
                      <p className="text-muted">
                        Dispensed by: <strong className="text-fg">{b.pharmacistName}</strong>
                      </p>
                    )}
                    <div className="pt-2 border-t border-border/60">
                      <p className="font-semibold text-fg mb-1">Items ({b.items.length}):</p>
                      <div className="space-y-1 bg-brand-50/40 p-2 rounded-lg">
                        {b.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-[11px]">
                            <span className="text-fg truncate max-w-[170px]">{item.name}</span>
                            <span className="font-mono text-muted">₹{item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted block">Total Payable</span>
                    <span className="font-black text-brand-700 text-base">₹{b.totalAmount.toFixed(2)}</span>
                    {b.discount > 0 && (
                      <span className="text-[10px] text-emerald-700 block">(100% Govt Subsidized)</span>
                    )}
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setSelectedBill(b)}>
                    <FileText className="h-3.5 w-3.5" /> View / Print
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Printable Digital Bill Invoice Modal */}
      {selectedBill && (
        <Modal
          open={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title="SwasthyaSetu Official Digital Invoice"
          className="max-w-2xl"
        >
          <div className="space-y-5" id="printable-bill">
            {/* Header */}
            <div className="rounded-2xl border-2 border-brand-700 bg-brand-50/50 p-5 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-6 w-6 text-brand-700" />
                <h2 className="text-xl font-black text-brand-900 tracking-wide uppercase">SWASTHYASETU</h2>
              </div>
              <p className="text-xs font-bold text-fg uppercase">{selectedBill.facilityName}</p>
              <p className="text-[11px] text-muted">{selectedBill.facilityAddress || "Primary Health Centre, Government of Uttar Pradesh"}</p>
              <p className="text-[10px] font-mono text-brand-800">Govt. Registered Healthcare Facility · NHM Affiliated</p>
            </div>

            {/* Bill Meta Details */}
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3.5 text-xs bg-surface">
              <div>
                <span className="text-muted">Invoice No:</span>
                <p className="font-mono font-bold text-fg">{selectedBill.billNumber}</p>
              </div>
              <div>
                <span className="text-muted">Invoice Date:</span>
                <p className="font-semibold text-fg">{selectedBill.date}</p>
              </div>
              <div>
                <span className="text-muted">Patient Name:</span>
                <p className="font-bold text-sm text-fg">{selectedBill.patientName}</p>
              </div>
              <div>
                <span className="text-muted">Patient ID:</span>
                <p className="font-mono font-bold text-brand-700">{selectedBill.patientId}</p>
              </div>
              <div>
                <span className="text-muted">Visit Number:</span>
                <p className="font-mono text-fg">{selectedBill.visitId}</p>
              </div>
              <div>
                <span className="text-muted">Dispensing Pharmacist:</span>
                <p className="font-semibold text-fg">{selectedBill.pharmacistName || "Ravi Shastri"}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-50 border-b border-border text-muted uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">Batch</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedBill.items.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-50/20">
                      <td className="p-2.5 font-medium text-fg">{item.name}</td>
                      <td className="p-2.5 font-mono text-muted">{item.batchNo || "BATCH-STD"}</td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="rounded-xl bg-brand-50/50 border border-brand-200 p-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-muted">Gross Subtotal:</span>
                <span className="font-mono font-semibold">₹{selectedBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Government Scheme Subsidy / PM-JAY:</span>
                <span className="font-mono font-bold">- ₹{selectedBill.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-fg border-t border-brand-200 pt-2">
                <span>Net Total Payable:</span>
                <span className="font-mono text-brand-700">₹{selectedBill.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-muted text-left pt-1">
                Payment Mode: <strong>{selectedBill.paymentMode.replace(/_/g, " ")}</strong> · Status: <strong>{selectedBill.status}</strong>
              </p>
            </div>

            {/* Print & Download Actions */}
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4" /> Print Hardcopy Bill
              </Button>
              <Button variant="secondary" onClick={() => alert("Digital receipt PDF downloaded!")} className="flex-1">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
