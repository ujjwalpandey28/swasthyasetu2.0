import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Receipt,
  Globe,
  BedDouble,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useHospitalDB } from "@/lib/database/db";

export function SuperAdminDashboard() {
  const facilities = useHospitalDB((s) => s.facilities);
  const patients = useHospitalDB((s) => s.patients);
  const bills = useHospitalDB((s) => s.bills);
  const auditLogs = useHospitalDB((s) => s.auditLogs);

  const totalBeds = facilities.reduce((acc, f) => acc + (f.bedCapacity ?? 0), 0);
  const occupiedBeds = facilities.reduce((acc, f) => acc + (f.occupiedBeds ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-orange-700 via-brand-800 to-indigo-950 p-6 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            National Health Mission &amp; ABDM Core
          </span>
          <h1 className="mt-1 text-2xl font-black">SwasthyaSetu Central Command &amp; Governance</h1>
          <p className="text-xs text-orange-100 mt-0.5">
            Inter-Facility Health Exchange · State-Level Population Analytics · Security &amp; Compliance Audit
          </p>
        </div>

        <Link to="/admin/audit-logs">
          <Button className="bg-white text-orange-950 hover:bg-orange-50 font-bold shadow-xl">
            <ShieldCheck className="h-4 w-4 text-orange-700" /> National Audit Ledger ({auditLogs.length})
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
            <Globe className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{facilities.length}</p>
            <p className="text-xs text-muted">Connected Health Facilities</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{patients.length}</p>
            <p className="text-xs text-muted">Issued Swasthya IDs</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <BedDouble className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{occupiedBeds} / {totalBeds}</p>
            <p className="text-xs text-muted">Bed Occupancy ({Math.round((occupiedBeds / totalBeds) * 100)}%)</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Receipt className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-fg">{bills.length}</p>
            <p className="text-xs text-muted">Cashless Bills Settled</p>
          </div>
        </Card>
      </div>

      {/* Facilities Network */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <CardTitle>State Health Infrastructure Network</CardTitle>
          <span className="text-xs text-muted">Real-time status across PHCs, CHCs, and District Hospitals</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.id} className="rounded-2xl border border-border p-4 space-y-2 bg-brand-50/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-fg">{f.name}</h4>
                  <p className="text-xs text-muted font-mono">{f.district} · {f.state}</p>
                </div>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                  {f.type}
                </span>
              </div>
              <p className="text-xs text-fg">Specialties: {f.specialties.join(", ")}</p>
              <div className="flex justify-between text-xs pt-2 border-t border-border text-muted">
                <span>Beds: <strong>{f.occupiedBeds} / {f.bedCapacity}</strong></span>
                <span className="text-emerald-700 font-semibold">● Online &amp; Synced</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
