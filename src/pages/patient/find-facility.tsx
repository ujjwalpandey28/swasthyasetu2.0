import { useEffect, useState } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { findNearbyFacilities } from "@/api/patient/facilities";
import type { Facility } from "@/dto/facility/Facility";
import { FacilityType } from "@/dto/constants/FacilityType";

const typeLabels: Record<FacilityType, string> = {
  [FacilityType.SUB_CENTRE]: "Sub-Centre",
  [FacilityType.PHC]: "PHC",
  [FacilityType.CHC]: "CHC",
  [FacilityType.DISTRICT_HOSPITAL]: "District Hospital",
  [FacilityType.PRIVATE]: "Private",
};

export function FindFacilityPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const data = await findNearbyFacilities();
      setFacilities(data);
      setLoading(false);
    })();
  }, []);

  const filtered = facilities.filter(
    (f) =>
      (type === "ALL" || f.type === type) &&
      (query === "" ||
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.district.toLowerCase().includes(query.toLowerCase()))
  );

  if (loading) return <LoadingBlob />;

  return (
    <div>
      <PageHeader
        title="Find a Facility"
        subtitle="Nearby public health facilities, sorted by distance"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name or district…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:max-w-[200px]">
          <option value="ALL">All Types</option>
          {(Object.values(FacilityType) as FacilityType[]).map((t) => (
            <option key={t} value={t}>{typeLabels[t]}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((f) => (
          <Card key={f.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-fg">{f.name}</h3>
                <p className="mt-0.5 text-sm text-muted">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {f.village}, {f.district}
                </p>
              </div>
              <Badge tone="INFO">{typeLabels[f.type]}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-brand-50 p-2">
                <p className="text-lg font-bold text-brand-700">{f.distanceKm?.toFixed(1)}km</p>
                <p className="text-xs text-muted">Distance</p>
              </div>
              <div className="rounded-lg bg-green-50 p-2">
                <p className="text-lg font-bold text-green-700">{(f.availableBeds ?? 0) > 0 ? f.availableBeds : "—"}</p>
                <p className="text-xs text-muted">Beds Free</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-2">
                <p className="text-lg font-bold text-sky-700">{f.doctorsAvailable}</p>
                <p className="text-xs text-muted">Doctors</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              {f.hasEmergency && <Badge tone="RED">Emergency</Badge>}
              {f.specialties.map((s) => (
                <span key={s} className="rounded bg-brand-50 px-2 py-0.5">{s}</span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted">
                <Clock className="mr-1 inline h-3 w-3" /> Avg wait {f.queueSize} in queue
              </span>
              <Button variant="secondary" size="sm">View / Book <ArrowRight className="h-3 w-3" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted">No facilities match your filters.</div>
      )}
    </div>
  );
}