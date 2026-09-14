import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  Pill,
  Receipt,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const visits = useHospitalDB((s) => s.visits);
  const medicines = useHospitalDB((s) => s.medicines);
  const prescriptions = useHospitalDB((s) => s.prescriptions);
  const testOrders = useHospitalDB((s) => s.testOrders);
  const transactions = useHospitalDB((s) => s.transactions);
  const bills = useHospitalDB((s) => s.bills);
  const auditLogs = useHospitalDB((s) => s.auditLogs);
  const facilities = useHospitalDB((s) => s.facilities);

  const facility = useMemo(() => {
    return facilities.find((f) => f.id === user?.facilityId) || facilities[0];
  }, [facilities, user]);

  // Aggregate Metrics for Healthcare Transparency
  const totalPrescriptions = prescriptions.length;
  const totalMedicinesDispensed = transactions.reduce(
    (acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalBillsGenerated = bills.length;

  const lowStockMeds = medicines.filter((m) => m.availability === "LOW_STOCK" || m.availability === "OUT_OF_STOCK");

  // Patient Journey Funnel Flow
  const journeyStats = {
    booked: visits.length,
    checkedIn: visits.filter((v) => v.status !== "BOOKED").length,
    consulted: visits.filter((v) => ["TESTS_PENDING", "TESTS_COMPLETED", "PHARMACY_PENDING", "MEDICINES_DISPENSED", "COMPLETED"].includes(v.status)).length,
    testsOrdered: testOrders.length,
    testsCompleted: testOrders.filter((t) => t.status === "COMPLETED").length,
    prescriptionsIssued: prescriptions.length,
    medicinesDispensed: prescriptions.filter((p) => p.status === "DISPENSED").length,
    completedVisits: visits.filter((v) => v.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-rose-700 via-brand-800 to-indigo-900 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            Hospital Administration &amp; Operational Governance
          </span>
          <h1 className="mt-1 text-2xl font-black">{facility.name}</h1>
          <p className="text-xs text-rose-100 mt-0.5">
            Operational Transparency · Real-Time Medicine Accountability · Journey Analytics · Audit Compliance
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/admin/audit-logs">
            <Button className="bg-white text-rose-900 hover:bg-rose-50 font-bold shadow-xl">
              <ShieldCheck className="h-4 w-4 text-rose-700" /> Immutable Audit Logs ({auditLogs.length})
            </Button>
          </Link>
          <Link to="/admin/medicines">
            <Button variant="secondary" className="border-white/30 text-white hover:bg-white/10">
              <Package className="h-4 w-4" /> Medicine Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* HEALTHCARE TRANSPARENCY METRICS */}
      <div>
        <h2 className="mb-3 text-base font-bold text-fg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-700" />
          Healthcare &amp; Medicine Transparency (Today's Real-Time Metrics)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex items-center gap-4 border-l-4 border-l-brand-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <FileCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-fg">{totalPrescriptions}</p>
              <p className="text-xs text-muted">Prescriptions Generated</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-pink-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-700">
              <Pill className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-fg">{totalMedicinesDispensed} units</p>
              <p className="text-xs text-muted">Medicines Dispensed</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-emerald-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Receipt className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-fg">{totalBillsGenerated}</p>
              <p className="text-xs text-muted">Bills &amp; Invoices Generated</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-indigo-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-fg">{journeyStats.completedVisits}</p>
              <p className="text-xs text-muted">Patients Fully Served</p>
            </div>
          </Card>
        </div>
      </div>

      {/* PATIENT JOURNEY TRACKING FUNNEL */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <CardTitle>Hospital Patient Journey Flow</CardTitle>
            <CardDescription className="text-xs">
              Live end-to-end operational pipeline from Appointment Booking to Consultation, Tests, Pharmacy &amp; Completion
            </CardDescription>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 border border-brand-200">
            {visits.length} Total Journeys
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8 text-center text-xs">
          <div className="rounded-2xl border border-border bg-brand-50/40 p-3">
            <span className="text-muted block text-[10px] uppercase font-semibold">1. Booked</span>
            <span className="text-xl font-black text-fg mt-1 block">{journeyStats.booked}</span>
          </div>
          <div className="rounded-2xl border border-border bg-blue-50/40 p-3">
            <span className="text-blue-800 block text-[10px] uppercase font-semibold">2. Checked In</span>
            <span className="text-xl font-black text-blue-900 mt-1 block">{journeyStats.checkedIn}</span>
          </div>
          <div className="rounded-2xl border border-border bg-indigo-50/40 p-3">
            <span className="text-indigo-800 block text-[10px] uppercase font-semibold">3. Consulted</span>
            <span className="text-xl font-black text-indigo-900 mt-1 block">{journeyStats.consulted}</span>
          </div>
          <div className="rounded-2xl border border-border bg-purple-50/40 p-3">
            <span className="text-purple-800 block text-[10px] uppercase font-semibold">4. Tests Ordered</span>
            <span className="text-xl font-black text-purple-900 mt-1 block">{journeyStats.testsOrdered}</span>
          </div>
          <div className="rounded-2xl border border-border bg-purple-100/50 p-3">
            <span className="text-purple-800 block text-[10px] uppercase font-semibold">5. Tests Done</span>
            <span className="text-xl font-black text-purple-900 mt-1 block">{journeyStats.testsCompleted}</span>
          </div>
          <div className="rounded-2xl border border-border bg-pink-50/40 p-3">
            <span className="text-pink-800 block text-[10px] uppercase font-semibold">6. Rx Issued</span>
            <span className="text-xl font-black text-pink-900 mt-1 block">{journeyStats.prescriptionsIssued}</span>
          </div>
          <div className="rounded-2xl border border-border bg-amber-50/40 p-3">
            <span className="text-amber-800 block text-[10px] uppercase font-semibold">7. Dispensed</span>
            <span className="text-xl font-black text-amber-900 mt-1 block">{journeyStats.medicinesDispensed}</span>
          </div>
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3">
            <span className="text-emerald-800 block text-[10px] uppercase font-semibold">8. Completed</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">{journeyStats.completedVisits}</span>
          </div>
        </div>
      </Card>

      {/* Two Columns: Recent Medicine Transactions & Low Stock Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medicine Dispensing Ledger */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <CardTitle className="text-sm">Recent Medicine Dispensing Transactions</CardTitle>
            <Link to="/admin/medicines" className="text-xs text-brand-700 font-semibold hover:underline">
              Full Ledger →
            </Link>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">No medicine transactions recorded.</p>
            ) : (
              transactions.slice(0, 4).map((txn) => (
                <div key={txn.id} className="rounded-xl border border-border p-3 text-xs space-y-1 bg-surface">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-800">{txn.transactionId}</span>
                    <span className="font-semibold text-fg">₹{txn.totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-muted">
                    Patient: <strong>{txn.patientName}</strong> ({txn.patientId}) · Pharmacist: <strong>{txn.pharmacistName}</strong>
                  </p>
                  <div className="text-[11px] text-muted pt-0.5">
                    Items: {txn.items.map((i) => `${i.medicineName} (${i.quantity}) [Batch ${i.batchNo}]`).join(", ")}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Low Stock & Inventory Alerts */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Stock &amp; Expiry Alerts
            </CardTitle>
            <Link to="/admin/medicines" className="text-xs text-brand-700 font-semibold hover:underline">
              Restock →
            </Link>
          </div>

          <div className="space-y-2">
            {lowStockMeds.map((med) => (
              <div key={med.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs">
                <div>
                  <p className="font-bold text-fg">{med.name}</p>
                  <p className="text-muted">
                    Stock: <strong className="text-red-700">{med.stockQty} {med.unit}s</strong> (Reorder at {med.reorderLevel})
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold border border-amber-300">
                  {med.availability.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}