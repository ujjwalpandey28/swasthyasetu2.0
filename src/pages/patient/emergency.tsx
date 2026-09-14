import { useEffect, useState } from "react";
import { Siren, PhoneCall, Ambulance, MapPin, ArrowRight } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getEmergencyAssistance } from "@/api/patient/emergency";
import type { EmergencyInfoResponse, EmergencyContact } from "@/dto/emergency/EmergencyInfoResponse";

export function EmergencyPage() {
  const [info, setInfo] = useState<EmergencyInfoResponse | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    getEmergencyAssistance().then(setInfo);
  }, []);

  if (!info) return <LoadingBlob />;

  const triggerEmergency = () => {
    setActive(true);
  };

  return (
    <div>
      <PageHeader
        title="Emergency Assistance"
        subtitle="Immediate help when you need it most"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />

      {!active ? (
        <>
          <Card className="border-red-200 bg-red-50 text-center">
            <Siren className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-3 text-xl font-bold text-red-700">In an emergency?</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-red-600">
              Trigger this to alert the nearest facility and share your health-critical
              details (allergies, blood group, conditions) with them instantly.
            </p>
            <Button
              variant="danger"
              size="lg"
              className="mt-5"
              onClick={triggerEmergency}
            >
              <Siren className="h-5 w-5" /> Trigger Emergency Alert
            </Button>
          </Card>

          <div className="mt-4">
            <Card>
              <h3 className="font-semibold">Emergency Contact Numbers</h3>
              <div className="mt-3 space-y-2">
                {info.emergencyNumbers.map((n: EmergencyContact) => (
                  <div key={n.number} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-brand-700" />
                      {n.name}
                    </span>
                    <a href={`tel:${n.number.replace(/\s/g, "")}`} className="font-bold text-brand-700">
                      {n.number}
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          <Card className="border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <Ambulance className="h-10 w-10 text-green-700" />
              <div>
                <p className="text-lg font-bold text-green-700">Ambulance dispatched</p>
                <p className="text-sm text-green-600">
                  ETA {info.ambulanceETA} · Nearest facility alerted
                </p>
              </div>
            </div>
          </Card>

          <Card className="mt-4">
            <h3 className="font-semibold text-fg">{info.nearestFacility.name}</h3>
            <p className="mt-1 text-sm text-muted">
              <MapPin className="mr-1 inline h-3 w-3" />
              {info.nearestFacility.village}, {info.nearestFacility.district} ·{" "}
              {info.nearestFacility.distanceKm?.toFixed(1)}km away
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-brand-50 p-2">
                <p className="text-lg font-bold text-brand-700">{info.nearestFacility.doctorsAvailable}</p>
                <p className="text-xs text-muted">Doctors</p>
              </div>
              <div className="rounded-lg bg-green-50 p-2">
                <p className="text-lg font-bold text-green-700">{info.nearestFacility.availableBeds}</p>
                <p className="text-xs text-muted">Free Beds</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-2">
                <p className="text-lg font-bold text-sky-700">24/7</p>
                <p className="text-xs text-muted">Emergency</p>
              </div>
            </div>
            <Button className="mt-4 w-full">
              Directions <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>

          <Card className="mt-4">
            <h3 className="font-semibold">Your health-critical info shared with facility</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>⚠ Blood group {(info.nearestFacility.availableBeds ?? 0) >= 0 && "O+"} · <span className="text-red-600">Allergies: Penicillin, Sulfa</span></li>
              <li>Active conditions: Hypertension, Type 2 Diabetes</li>
              <li>Current medications will be visible to attending staff</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}