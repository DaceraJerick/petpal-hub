import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Heart, Utensils, FileText, Syringe, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PillBadge } from "@/components/ui/pill-badge";

const mockPet = {
  id: "1", name: "Buddy", species: "Dog", breed: "Labrador Retriever", dob: "2023-03-15",
  weight: 28, gender: "Male", emoji: "🐕", microchipId: "123456789",
  allergies: "Chicken", notes: "Very friendly and energetic", healthScore: 85,
};

const mockVaccines = [
  { name: "Rabies", date: "2025-09-10", nextDue: "2026-09-10", status: "up-to-date" },
  { name: "DHPP", date: "2025-06-20", nextDue: "2026-06-20", status: "up-to-date" },
  { name: "Bordetella", date: "2025-01-15", nextDue: "2026-01-15", status: "due-soon" },
];

const mockMedications = [
  { name: "Heartgard", dosage: "1 chew", frequency: "Monthly", active: true },
  { name: "Frontline", dosage: "1 pipette", frequency: "Monthly", active: true },
];

export default function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-black flex-1">{mockPet.name}</h1>
        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>

      {/* Pet Card */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-5xl">
              {mockPet.emoji}
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-black">{mockPet.name}</h2>
              <p className="text-sm text-muted-foreground">{mockPet.breed}</p>
              <div className="mt-2 flex gap-2">
                <PillBadge>{mockPet.species}</PillBadge>
                <PillBadge variant="muted">{mockPet.gender === "Male" ? "♂️" : "♀️"} {mockPet.gender}</PillBadge>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-heading text-lg font-black text-primary">3yr</p>
              <p className="text-xs text-muted-foreground">Age</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-heading text-lg font-black text-primary">{mockPet.weight}kg</p>
              <p className="text-xs text-muted-foreground">Weight</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-heading text-lg font-black text-primary">{mockPet.healthScore}%</p>
              <p className="text-xs text-muted-foreground">Health</p>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={mockPet.healthScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="health" className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="health" className="flex-1"><Heart className="mr-1 h-3.5 w-3.5" /> Health</TabsTrigger>
          <TabsTrigger value="feeding" className="flex-1"><Utensils className="mr-1 h-3.5 w-3.5" /> Feeding</TabsTrigger>
          <TabsTrigger value="records" className="flex-1"><FileText className="mr-1 h-3.5 w-3.5" /> Records</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4 space-y-4">
          {/* Vaccines */}
          <div>
            <h3 className="font-heading text-base font-bold flex items-center gap-1.5 mb-2">
              <Syringe className="h-4 w-4 text-primary" /> Vaccines
            </h3>
            <div className="space-y-2">
              {mockVaccines.map((v) => (
                <Card key={v.name} className="shadow-card">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">Given: {v.date}</p>
                    </div>
                    <div className="text-right">
                      <PillBadge variant={v.status === "up-to-date" ? "success" : "warning"}>
                        {v.status === "up-to-date" ? "✅ Up to date" : "⚠️ Due soon"}
                      </PillBadge>
                      <p className="text-xs text-muted-foreground mt-1">Next: {v.nextDue}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <h3 className="font-heading text-base font-bold flex items-center gap-1.5 mb-2">
              <Pill className="h-4 w-4 text-accent" /> Medications
            </h3>
            <div className="space-y-2">
              {mockMedications.map((m) => (
                <Card key={m.name} className="shadow-card">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.dosage} — {m.frequency}</p>
                    </div>
                    <PillBadge variant="success">Active</PillBadge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feeding" className="mt-4">
          <Button onClick={() => navigate(`/pets/${id}/feeding`)} className="w-full rounded-full">
            <Utensils className="mr-2 h-4 w-4" /> Open Feeding Manager
          </Button>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <Button onClick={() => navigate(`/pets/${id}/health`)} className="w-full rounded-full">
            <FileText className="mr-2 h-4 w-4" /> View Health Records
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
