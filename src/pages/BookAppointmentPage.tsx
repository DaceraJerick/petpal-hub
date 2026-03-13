import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingCard } from "@/components/ui/loading-card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedPet, setSelectedPet] = useState("");
  const [vetName, setVetName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: clinics = [], isLoading: clinicsLoading } = useQuery({
    queryKey: ["vet-clinics"],
    queryFn: async () => {
      const { data } = await supabase.from("vet_clinics").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: pets = [] } = useQuery({
    queryKey: ["pets", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("pets").select("id, name").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPet) return;
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      pet_id: selectedPet,
      clinic_id: selectedClinic || null,
      vet_name: vetName || null,
      date,
      time,
      reason: reason || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    toast({ title: "Appointment booked! 🎉", description: "You'll receive a confirmation soon." });
    navigate("/appointments");
  };

  // Center map on Philippines (Manila)
  const mapCenter: [number, number] = clinics.length > 0 && clinics[0].latitude
    ? [Number(clinics[0].latitude), Number(clinics[0].longitude)]
    : [14.5995, 120.9842];

  if (clinicsLoading) return <div className="container mx-auto max-w-3xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/appointments")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-heading text-xl font-black">Book Appointment</h1>
      </div>

      {clinics.length > 0 && (
        <Card className="shadow-card mb-6 overflow-hidden">
          <div className="h-[250px] w-full">
            <MapContainer center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {clinics.filter(c => c.latitude && c.longitude).map((clinic) => (
                <Marker key={clinic.id} position={[Number(clinic.latitude), Number(clinic.longitude)]}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{clinic.name}</strong><br />
                      <span className="text-xs">{clinic.address}</span><br />
                      <Button size="sm" className="mt-2 rounded-full text-xs" onClick={() => setSelectedClinic(clinic.id)}>Select Clinic</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      )}

      <div className="space-y-2 mb-6">
        {clinics.map((clinic) => (
          <Card key={clinic.id} className={`cursor-pointer shadow-card transition-all ${selectedClinic === clinic.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedClinic(clinic.id)}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light"><MapPin className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{clinic.name}</p>
                <p className="text-xs text-muted-foreground">{clinic.address}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {clinic.operating_hours && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {clinic.operating_hours}</div>}
                {clinic.phone && <div className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {clinic.phone}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleBook} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Pet *</Label>
            <Select value={selectedPet} onValueChange={setSelectedPet} required>
              <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
              <SelectContent>
                {pets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vet Name</Label>
            <Input placeholder="Dr. Santos" value={vetName} onChange={e => setVetName(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Date *</Label><Input type="date" required value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="space-y-2"><Label>Time *</Label><Input type="time" required value={time} onChange={e => setTime(e.target.value)} /></div>
        </div>
        <div className="space-y-2">
          <Label>Reason for visit</Label>
          <Textarea placeholder="e.g. Annual checkup, vaccination..." value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <Button type="submit" className="w-full rounded-full font-heading font-bold" disabled={loading || !selectedPet}>
          {loading ? "Booking..." : "Book Appointment 📅"}
        </Button>
      </form>
    </div>
  );
}
