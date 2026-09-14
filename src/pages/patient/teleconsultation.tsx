import { useEffect, useState } from "react";
import { Video, CalendarClock, Stethoscope } from "lucide-react";
import { PageHeader, LoadingBlob } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getTeleconsultSlots, bookTeleconsult } from "@/api/patient/teleconsultation";
import type { TeleconsultSlot } from "@/dto/teleconsultation/TeleconsultSlot";

export function TeleconsultationPage() {
  const [slots, setSlots] = useState<TeleconsultSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<TeleconsultSlot | null>(null);

  useEffect(() => {
    getTeleconsultSlots().then((d) => {
      setSlots(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlob />;

  const handleJoin = async (slot: TeleconsultSlot) => {
    const updated = await bookTeleconsult(slot.id);
    setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setJoining(slot);
  };

  return (
    <div>
      <PageHeader
        title="Teleconsultation"
        subtitle="Consult a doctor from home"
        backTo="/patient"
        backLabel="Back to Patient Dashboard"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{s.doctorName}</p>
                <p className="text-xs text-muted">{s.specialty}</p>
              </div>
              <Badge tone={s.available ? "GREEN" : "YELLOW"}>
                {s.available ? "Available" : "Booked"}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <CalendarClock className="h-4 w-4" /> {s.date} · {s.time}
            </div>
            <Button
              className="mt-4 w-full"
              variant={s.available ? "primary" : "outline"}
              disabled={!s.available}
              onClick={() => handleJoin(s)}
            >
              <Video className="h-4 w-4" /> Join Video Call
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={!!joining} onClose={() => setJoining(null)} title="Starting Video Consultation…">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Video className="h-10 w-10" />
          </div>
          <p className="font-medium">{joining?.doctorName}</p>
          <p className="text-sm text-muted">{joining?.specialty} consultation</p>
          <p className="mt-2 text-sm text-muted">
            In a live deployment this would open a secure video room. Here we simulate the flow.
          </p>
          <Button className="mt-4" onClick={() => setJoining(null)}>
            End Call
          </Button>
        </div>
      </Modal>
    </div>
  );
}