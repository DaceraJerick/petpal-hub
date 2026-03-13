import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "grooming", "boarding", "dog_walking", "pharmacy", "training"];
const categoryLabels: Record<string, string> = { grooming: "Grooming", boarding: "Boarding", dog_walking: "Dog Walking", pharmacy: "Pharmacy", training: "Training" };

export default function ServicesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

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

  if (isLoading) return <div className="container mx-auto max-w-5xl px-4 py-4"><LoadingCard /><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title="Pet Services 🛎" subtitle="Find the best care for your pets in the Philippines" />

      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary"}`}>
            {cat === "All" ? "All" : categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

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
