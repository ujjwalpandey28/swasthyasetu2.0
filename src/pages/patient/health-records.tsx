import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { LongitudinalRecord } from "@/components/shared/LongitudinalRecord";
import { getHealthRecord } from "@/api/patient/records";
import type { HealthRecordResponse } from "@/dto/health-record/HealthRecordResponse";

export function HealthRecordsPage() {
  const [record, setRecord] = useState<HealthRecordResponse | null>(null);

  useEffect(() => {
    getHealthRecord().then(setRecord);
  }, []);

  if (!record) return <LoadingBlob />;

  const handlePrint = () => window.print();

  return (
    <div>
      <PageHeader
        title="My Health Records"
        subtitle="Your complete medical history across all facilities"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
        actions={
          <>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="secondary">
              <Download className="h-4 w-4" /> Download
            </Button>
          </>
        }
      />
      <LongitudinalRecord record={record} />
    </div>
  );
}