import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PillBadge } from "@/components/ui/pill-badge";
import { LoadingCard } from "@/components/ui/loading-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const categoryLabels: Record<string, string> = { grooming: "Grooming", boarding: "Boarding", dog_walking: "Dog Walking", pharmacy: "Pharmacy", training: "Training" };

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPet, setSelectedPet] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["service-reviews", id],
    queryFn: async () => {
      const { data } = await supabase.from("service_reviews").select("*, profiles(name)").eq("service_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
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
    const { error } = await supabase.from("service_bookings").insert({
      user_id: user.id, pet_id: selectedPet, service_id: id!, booking_date: bookDate, booking_time: bookTime || null, notes: notes || null,
    });
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Service booked! 🎉" });
    navigate("/services");
  };

  if (isLoading || !service) return <div className="container mx-auto max-w-3xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/services")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-heading text-xl font-black flex-1">{service.name}</h1>
      </div>

      <Card className="shadow-card mb-6">
        <CardContent className="p-5">
          <PillBadge className="mb-2">{categoryLabels[service.category] || service.category}</PillBadge>
          <h2 className="font-heading text-2xl font-black">{service.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            {service.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {service.location}</div>}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(service.rating) || 0) ? "fill-warning text-warning" : "text-border"}`} />)}
            </div>
            <span className="font-heading font-bold">{service.rating || "—"}</span>
            <span className="text-xs text-muted-foreground">({service.review_count || 0} reviews)</span>
          </div>
          <div className="mt-3"><span className="font-heading text-2xl font-black text-primary">{service.price || "—"}</span></div>
        </CardContent>
      </Card>

      {(service as any).latitude && (service as any).longitude && (
        <Card className="shadow-card mb-6 overflow-hidden">
          <div className="h-[250px] w-full">
            <MapContainer center={[Number((service as any).latitude), Number((service as any).longitude)]} zoom={15} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[Number((service as any).latitude), Number((service as any).longitude)]}>
                <Popup><strong>{service.name}</strong><br /><span className="text-xs">{service.location}</span></Popup>
              </Marker>
            </MapContainer>
          </div>
        </Card>
      )}

        <CardContent className="p-5">
          <h3 className="font-heading text-lg font-bold mb-4">Book This Service</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="space-y-2">
              <Label>Pet *</Label>
              <Select value={selectedPet} onValueChange={setSelectedPet} required>
                <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{pets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={bookTime} onChange={e => setBookTime(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Notes (optional)</Label><Textarea placeholder="Any special requests?" value={notes} onChange={e => setNotes(e.target.value)} /></div>
            <Button type="submit" className="w-full rounded-full font-heading font-bold" disabled={loading || !selectedPet}>
              {loading ? "Booking..." : "Book Now 🛎"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h3 className="font-heading text-lg font-bold mb-3">Reviews</h3>
        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
          {reviews.map((review: any) => (
            <Card key={review.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.profiles?.name || "Anonymous"}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-warning text-warning" : "text-border"}`} />)}
                  </div>
                </div>
                {review.review_text && <p className="mt-1 text-sm text-muted-foreground">{review.review_text}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{review.created_at?.split("T")[0]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
