import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, Map, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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

const categories = ["All", "grooming", "boarding", "dog_walking", "pharmacy", "training"];
const categoryLabels: Record<string, string> = { grooming: "Grooming", boarding: "Boarding", dog_walking: "Dog Walking", pharmacy: "Pharmacy", training: "Training" };

export default function ServicesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("rating", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = services.filter((s) => {
    const matchCategory = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const mapCenter: [number, number] = [14.5995, 120.9842];

  if (isLoading) return <div className="container mx-auto max-w-5xl px-4 py-4"><LoadingCard /><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title="Pet Services 🛎" subtitle="Find the best care for your pets in the Philippines" />

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant={viewMode === "map" ? "default" : "outline"} size="icon" onClick={() => setViewMode(viewMode === "map" ? "list" : "map")} className="shrink-0">
          {viewMode === "map" ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary"}`}>
            {cat === "All" ? "All" : categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {viewMode === "map" && (
        <Card className="mt-4 shadow-card overflow-hidden">
          <div className="h-[300px] md:h-[400px] w-full">
            <MapContainer center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filtered.filter((s: any) => s.latitude && s.longitude).map((service: any) => (
                <Marker key={service.id} position={[Number(service.latitude), Number(service.longitude)]}>
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <strong>{service.name}</strong>
                      <p className="text-xs text-gray-500 mt-1">{categoryLabels[service.category] || service.category}</p>
                      {service.location && <p className="text-xs mt-1 flex items-center gap-1">{service.location}</p>}
                      <p className="text-xs font-bold mt-1">{service.price || "—"}</p>
                      <Button size="sm" className="mt-2 w-full rounded-full text-xs" onClick={() => navigate(`/services/${service.id}`)}>View Details</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service, i) => (
          <motion.div key={service.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="cursor-pointer shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5" onClick={() => navigate(`/services/${service.id}`)}>
              <CardContent className="p-4">
                <PillBadge variant="muted" className="mb-2">{categoryLabels[service.category] || service.category}</PillBadge>
                <h3 className="font-heading text-base font-bold">{service.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-heading font-bold text-primary">{service.price || "—"}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {service.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {service.location}</span>}
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {service.rating || "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-8">No services found.</p>}
      </div>
    </div>
  );
}
