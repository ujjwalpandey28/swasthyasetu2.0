import { useEffect, useState } from "react";
import { Pill, MapPin } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { searchMedicineAvailability } from "@/api/patient/medicines";
import type { MedicineResponse } from "@/dto/medicine/MedicineResponse";

const stockTone: Record<string, "GREEN" | "YELLOW" | "RED"> = {
  IN_STOCK: "GREEN",
  LOW_STOCK: "YELLOW",
  OUT_OF_STOCK: "RED",
};

export function MedicineAvailabilityPage() {
  const [items, setItems] = useState<MedicineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    searchMedicineAvailability().then((d) => {
      setItems(d);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter((m) => {
    const q = query.toLowerCase();
    return (
      q === "" ||
      m.name.toLowerCase().includes(q) ||
      m.generic.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingBlob />;

  return (
    <div>
      <PageHeader
        title="Medicine Availability"
        subtitle="Check medicine stock at nearby facilities"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />
      <div className="mb-4 max-w-xs">
        <Input
          placeholder="Search medicine…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={`${m.id}-${m.facilityId}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Pill className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted">{m.generic}</p>
                </div>
              </div>
              <Badge tone={stockTone[m.availability]}>
                {m.availability.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted flex items-center">
                <MapPin className="mr-1 h-3 w-3" /> {m.facilityName}
              </span>
              <span className="font-medium">
                {m.availability === "IN_STOCK" ? `${m.stockQty} ${m.unit}s` : m.availability === "OUT_OF_STOCK" ? "Unavailable" : `${m.stockQty} left`}
              </span>
            </div>
            {m.cost != null && (
              <p className="mt-2 text-xs text-muted">≈ ₹{m.cost} / {m.unit}</p>
            )}
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted">No medicines match your search.</div>
      )}
    </div>
  );
}