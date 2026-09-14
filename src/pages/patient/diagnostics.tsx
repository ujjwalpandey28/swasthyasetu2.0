import { useEffect, useState } from "react";
import { FlaskConical, Download } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getDiagnosticReports } from "@/api/patient/diagnostics";
import type { DiagnosticReport } from "@/dto/diagnostics/DiagnosticReport";

export function DiagnosticsPage() {
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiagnosticReports().then((d) => {
      setReports(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlob />;

  return (
    <div>
      <PageHeader
        title="Diagnostic Reports"
        subtitle="View your lab tests and imaging reports"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.slice().reverse().map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted">{r.type} · {r.facilityName}</p>
                </div>
              </div>
              <Badge tone={r.status === "REVIEWED" ? "GREEN" : r.status === "PENDING" ? "YELLOW" : "INFO"}>
                {r.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted">Ordered by {r.orderedBy} · {r.date}</p>
            {r.summary && <p className="mt-2 text-sm">{r.summary}</p>}
            {r.keyValues && (
              <div className="mt-3 space-y-1.5">
                {r.keyValues.map((kv) => (
                  <div key={kv.label} className="flex items-center justify-between rounded bg-brand-50 px-3 py-1.5 text-sm">
                    <span>{kv.label}</span>
                    <span className={kv.flag === "ABNORMAL" ? "font-semibold text-red-600" : "text-green-700"}>
                      {kv.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {r.status !== "PENDING" && (
              <Button variant="outline" size="sm" className="mt-3">
                <Download className="h-3 w-3" /> View Report
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}