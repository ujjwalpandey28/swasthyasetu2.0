import { useEffect, useState } from "react";
import { GitPullRequest, CheckCircle2 } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getReferralStatus } from "@/api/patient/referral-status";
import { REFERRAL_FLOW } from "@/dto/constants/ReferralStatus";
import type { Referral } from "@/dto/referral/Referral";
import type { ReferralStatus as RS } from "@/dto/constants/ReferralStatus";

const statusTone: Record<RS, "INFO" | "GREEN" | "YELLOW" | "RED"> = {
  CREATED: "INFO",
  SENT: "YELLOW",
  ACCEPTED: "YELLOW",
  ARRIVED: "INFO",
  COMPLETED: "GREEN",
  FOLLOW_UP_SCHEDULED: "GREEN",
};

export function ReferralStatusPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferralStatus("SWA-9284-1829").then((d) => {
      setReferrals(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlob />;

  return (
    <div>
      <PageHeader
        title="Referral Status"
        subtitle="Track the progress of your referrals"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />
      <div className="space-y-4">
        {referrals.length === 0 && (
          <div className="py-16 text-center text-muted">No referrals found.</div>
        )}
        {referrals.map((r) => {
          const currentIdx = REFERRAL_FLOW.indexOf(r.status);
          return (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <GitPullRequest className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{r.id} · {r.specialty}</p>
                    <p className="text-sm text-muted">{r.reason}</p>
                  </div>
                </div>
                <Badge tone={statusTone[r.status]}>{r.status.replace(/_/g, " ")}</Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  {REFERRAL_FLOW.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold
                            ${i <= currentIdx ? "bg-brand-700 text-white" : "bg-brand-50 text-muted"}
                          `}
                        >
                          {i < currentIdx || s === r.status ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <span className={`mt-1 hidden text-[10px] sm:block ${i <= currentIdx ? "text-brand-700" : "text-muted"}`}>
                          {s.replace(/_/g, " ")}
                        </span>
                      </div>
                      {i < REFERRAL_FLOW.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 ${i < currentIdx ? "bg-brand-700" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}