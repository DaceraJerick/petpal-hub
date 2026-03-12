import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PawPrint } from "lucide-react";
import { motion } from "framer-motion";

const mockPets = [
  { id: "1", name: "Buddy", species: "Dog", breed: "Labrador Retriever", age: "3 years", weight: "28 kg", gender: "Male", emoji: "🐕", healthScore: 85 },
  { id: "2", name: "Luna", species: "Cat", breed: "Persian", age: "2 years", weight: "4.5 kg", gender: "Female", emoji: "🐈", healthScore: 72 },
  { id: "3", name: "Charlie", species: "Dog", breed: "Golden Retriever", age: "5 years", weight: "32 kg", gender: "Male", emoji: "🐕", healthScore: 90 },
];

export default function PetListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockPets.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title="My Pets 🐾" subtitle="Manage your pet profiles">
        <Button onClick={() => navigate("/pets/new")} className="rounded-full" size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Pet
        </Button>
      </PageHeader>

      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="No pets yet"
          description="Add your first pet to start tracking their care"
          actionLabel="Add Pet"
          onAction={() => navigate("/pets/new")}
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5"
                onClick={() => navigate(`/pets/${pet.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-3xl">
                      {pet.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground">{pet.breed}</p>
                    </div>
                    <PillBadge>{pet.species}</PillBadge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>🎂 {pet.age}</span>
                    <span>⚖️ {pet.weight}</span>
                    <span>{pet.gender === "Male" ? "♂️" : "♀️"} {pet.gender}</span>
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
