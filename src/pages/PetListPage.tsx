import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { differenceInYears, differenceInMonths } from "date-fns";

function petAge(dob: string | null): string {
  if (!dob) return "Unknown";
  const years = differenceInYears(new Date(), new Date(dob));
  if (years > 0) return `${years} yr${years > 1 ? "s" : ""}`;
  const months = differenceInMonths(new Date(), new Date(dob));
  return `${months} mo`;
}

const speciesEmoji: Record<string, string> = { Dog: "🐕", Cat: "🐈", Bird: "🐦", Fish: "🐟", Rabbit: "🐇", Hamster: "🐹" };

export default function PetListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const { data: pets, isLoading } = useQuery({
    queryKey: ["pets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = (pets ?? []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="container mx-auto max-w-5xl px-4 py-4"><LoadingCard /><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title="My Pets 🐾" subtitle="Manage your pet profiles">
        <Button onClick={() => navigate("/pets/new")} className="rounded-full" size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Pet
        </Button>
      </PageHeader>

      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={PawPrint} title="No pets yet" description="Add your first pet to start tracking their care" actionLabel="Add Pet" onAction={() => navigate("/pets/new")} />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet, i) => (
            <motion.div key={pet.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="cursor-pointer shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5" onClick={() => navigate(`/pets/${pet.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-3xl">
                      {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} className="h-14 w-14 rounded-full object-cover" /> : (speciesEmoji[pet.species] || "🐾")}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground">{pet.breed || pet.species}</p>
                    </div>
                    <PillBadge>{pet.species}</PillBadge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>🎂 {petAge(pet.dob)}</span>
                    <span>⚖️ {pet.weight ? `${pet.weight} kg` : "—"}</span>
                    <span>{pet.gender === "male" ? "♂️" : pet.gender === "female" ? "♀️" : "⚧"} {pet.gender || "Unknown"}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
