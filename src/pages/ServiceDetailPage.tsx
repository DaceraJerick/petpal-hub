import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PillBadge } from "@/components/ui/pill-badge";
import { useToast } from "@/hooks/use-toast";

const mockService = {
  id: "1", name: "Paw Perfect Grooming", category: "Grooming", price: "$45",
  location: "123 Pet Street, Downtown", phone: "(555) 111-2222", hours: "9AM-6PM",
  rating: 4.8, reviewCount: 124,
  desc: "Full grooming service including bath, haircut, nail trim, ear cleaning, and teeth brushing. We use premium pet-safe products.",
};

const mockReviews = [
  { user: "Sarah M.", rating: 5, text: "Amazing service! Buddy loved it.", date: "2026-02-28" },
  { user: "John D.", rating: 4, text: "Very professional, a bit pricey though.", date: "2026-02-15" },
  { user: "Emma K.", rating: 5, text: "Best grooming in town. Luna came back so fluffy!", date: "2026-01-20" },
];

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Service booked! 🎉", description: "You'll receive a confirmation shortly." });
    navigate("/services");
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/services")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-black flex-1">{mockService.name}</h1>
      </div>

      <Card className="shadow-card mb-6">
        <CardContent className="p-5">
          <PillBadge className="mb-2">{mockService.category}</PillBadge>
          <h2 className="font-heading text-2xl font-black">{mockService.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{mockService.desc}</p>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {mockService.location}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {mockService.phone}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {mockService.hours}</div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(mockService.rating) ? "fill-warning text-warning" : "text-border"}`} />
              ))}
            </div>
            <span className="font-heading font-bold">{mockService.rating}</span>
            <span className="text-xs text-muted-foreground">({mockService.reviewCount} reviews)</span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-black text-primary">{mockService.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-5">
          <h3 className="font-heading text-lg font-bold mb-4">Book This Service</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="space-y-2">
              <Label>Pet</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Buddy</SelectItem>
                  <SelectItem value="2">Luna</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any special requests?" />
            </div>
            <Button type="submit" className="w-full rounded-full font-heading font-bold">
              Book Now 🛎
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reviews */}
      <section>
        <h3 className="font-heading text-lg font-bold mb-3">Reviews</h3>
        <div className="space-y-3">
          {mockReviews.map((review, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.user}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-warning text-warning" : "text-border"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{review.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
