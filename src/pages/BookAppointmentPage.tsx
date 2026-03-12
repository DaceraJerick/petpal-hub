import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const mockClinics = [
  { id: "1", name: "Happy Paws Clinic", address: "123 Pet St", phone: "(555) 123-4567", lat: 14.5995, lng: 120.9842, hours: "8AM-6PM" },
  { id: "2", name: "City Vet Center", address: "456 Animal Ave", phone: "(555) 234-5678", lat: 14.6042, lng: 120.9882, hours: "9AM-7PM" },
  { id: "3", name: "Animal Care Plus", address: "789 Clinic Rd", phone: "(555) 345-6789", lat: 14.5910, lng: 120.9780, hours: "7AM-8PM" },
];

const mockPets = [
  { id: "1", name: "Buddy" },
  { id: "2", name: "Luna" },
];

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClinic, setSelectedClinic] = useState<string>("");

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Appointment booked! 🎉", description: "You'll receive a confirmation soon." });
    navigate("/appointments");
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/appointments")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-black">Book Appointment</h1>
      </div>

      {/* Map */}
      <Card className="shadow-card mb-6 overflow-hidden">
        <div className="h-[250px] w-full">
          <MapContainer center={[14.5995, 120.9842]} zoom={14} className="h-full w-full" scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mockClinics.map((clinic) => (
              <Marker key={clinic.id} position={[clinic.lat, clinic.lng]}>
                <Popup>
                  <div className="text-sm">
                    <strong>{clinic.name}</strong>
                    <br />
                    <span className="text-xs">{clinic.address}</span>
                    <br />
                    <Button
                      size="sm"
                      className="mt-2 rounded-full text-xs"
                      onClick={() => setSelectedClinic(clinic.id)}
                    >
                      Select Clinic
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* Clinics List */}
      <div className="space-y-2 mb-6">
        {mockClinics.map((clinic) => (
          <Card
            key={clinic.id}
            className={`cursor-pointer shadow-card transition-all ${selectedClinic === clinic.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedClinic(clinic.id)}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{clinic.name}</p>
                <p className="text-xs text-muted-foreground">{clinic.address}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {clinic.hours}</div>
                <div className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {clinic.phone}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Form */}
      <form onSubmit={handleBook} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Pet</Label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
              <SelectContent>
                {mockPets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vet Name</Label>
            <Input placeholder="Dr. Smith" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" required />
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input type="time" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Reason for visit</Label>
          <Textarea placeholder="e.g. Annual checkup, vaccination..." />
        </div>
        <Button type="submit" className="w-full rounded-full font-heading font-bold">
          Book Appointment 📅
        </Button>
      </form>
    </div>
  );
}
