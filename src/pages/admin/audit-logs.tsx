import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { useHospitalDB } from "@/lib/database/db";

export function AuditLogsPage() {
  const auditLogs = useHospitalDB((s) => s.auditLogs);

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = useMemo(() => {
    let list = auditLogs;
    if (actionFilter !== "ALL") {
      list = list.filter((l) => l.action === actionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.targetId && l.targetId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [auditLogs, actionFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Immutable Audit Ledger"
        subtitle="Chronological audit history of all registrations, check-ins, prescriptions, medicine scans, and bill transactions"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-56 text-xs"
          >
            <option value="ALL">All Actions ({auditLogs.length})</option>
            <option value="PATIENT_REGISTERED">Patient Registered</option>
            <option value="APPOINTMENT_BOOKED">Appointment Booked</option>
            <option value="PATIENT_CHECKED_IN">Patient Checked In</option>
            <option value="CONSULTATION_SAVED">Consultation Completed</option>
            <option value="TESTS_ORDERED">Tests Ordered</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="TEST_RESULT_UPLOADED">Test Result Uploaded</option>
            <option value="PRESCRIPTION_CREATED">Prescription Created</option>
            <option value="MEDICINE_DISPENSED">Medicine Dispensed</option>
          </Select>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by actor, patient, or details…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-brand-50/70 text-muted uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor &amp; Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details &amp; Audit Trail</th>
                <th className="p-3">Target Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-50/20 transition">
                    <td className="p-3 font-mono text-[11px] text-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-fg">{log.actorName}</p>
                      <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-800">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3 text-fg max-w-md">{log.details}</td>
                    <td className="p-3 font-mono text-[11px] text-brand-700 font-bold whitespace-nowrap">
                      {log.targetEntity ? `${log.targetEntity}: ${log.targetId}` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
