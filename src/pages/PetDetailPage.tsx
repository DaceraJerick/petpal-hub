import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Heart, Utensils, FileText, Syringe, Pill, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PillBadge } from "@/components/ui/pill-badge";
import { LoadingCard } from "@/components/ui/loading-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { differenceInYears, differenceInMonths } from "date-fns";
import { getVaccineStatus, calculateHealthScore } from "@/lib/health-score";
import { useState } from "react";

const speciesEmoji: Record<string, string> = { Dog: "🐕", Cat: "🐈", Bird: "🐦", Fish: "🐟" };

function petAge(dob: string | null): string {
  if (!dob) return "—";
  const y = differenceInYears(new Date(), new Date(dob));
  if (y > 0) return `${y}yr`;
  return `${differenceInMonths(new Date(), new Date(dob))}mo`;
}

export default function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vaccineOpen, setVaccineOpen] = useState(false);
  const [vName, setVName] = useState("");
  const [vDate, setVDate] = useState("");
  const [vNext, setVNext] = useState("");
  const [vBy, setVBy] = useState("");
  const [medOpen, setMedOpen] = useState(false);
  const [mName, setMName] = useState("");
  const [mDosage, setMDosage] = useState("");
  const [mFreq, setMFreq] = useState("");

  const { data: pet, isLoading } = useQuery({
    queryKey: ["pet", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pets").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: vaccines = [] } = useQuery({
    queryKey: ["vaccines", id],
    queryFn: async () => {
      const { data } = await supabase.from("vaccines").select("*").eq("pet_id", id!).order("date_given", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["medications", id],
    queryFn: async () => {
      const { data } = await supabase.from("medications").select("*").eq("pet_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["pet-appointments", id],
    queryFn: async () => {
      const { data } = await supabase.from("appointments").select("*").eq("pet_id", id!).eq("status", "completed").order("date", { ascending: false }).limit(1);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: feedingLogs = [] } = useQuery({
    queryKey: ["feeding-adherence", id],
    queryFn: async () => {
      const { data: schedules } = await supabase.from("feeding_schedules").select("id").eq("pet_id", id!).eq("active", true);
      if (!schedules || schedules.length === 0) return [];
      const scheduleIds = schedules.map(s => s.id);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: logs } = await supabase.from("feeding_logs").select("*").in("schedule_id", scheduleIds).gte("date", sevenDaysAgo.toISOString().split("T")[0]);
      return logs ?? [];
    },
    enabled: !!id,
  });

  const { data: scheduleCount = 0 } = useQuery({
    queryKey: ["schedule-count", id],
    queryFn: async () => {
      const { count } = await supabase.from("feeding_schedules").select("*", { count: "exact", head: true }).eq("pet_id", id!).eq("active", true);
      return count ?? 0;
    },
    enabled: !!id,
  });

  const deletePet = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pets").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast({ title: "Pet deleted" });
      navigate("/pets");
    },
  });

  const addVaccine = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vaccines").insert({ pet_id: id!, vaccine_name: vName, date_given: vDate || null, next_due: vNext || null, administered_by: vBy || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines", id] });
      setVaccineOpen(false);
      setVName(""); setVDate(""); setVNext(""); setVBy("");
      toast({ title: "Vaccine added ✅" });
    },
  });

  const addMed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("medications").insert({ pet_id: id!, med_name: mName, dosage: mDosage || null, frequency: mFreq || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", id] });
      setMedOpen(false);
      setMName(""); setMDosage(""); setMFreq("");
      toast({ title: "Medication added ✅" });
    },
  });

  if (isLoading || !pet) return <div className="container mx-auto max-w-3xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  const totalExpected = scheduleCount * 7;
  const givenLogs = feedingLogs.filter(l => l.given_at && !l.skipped);
  const feedingAdherence = totalExpected > 0 ? givenLogs.length / totalExpected : 0.5;

  const healthScore = calculateHealthScore({
    feedingAdherence7d: feedingAdherence,
    lastVetVisitDate: appointments[0]?.date ?? null,
    vaccines: vaccines.map(v => ({ nextDue: v.next_due })),
    medications: medications.map(m => ({ active: m.active ?? false, endDate: m.end_date })),
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pets")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-heading text-xl font-black flex-1">{pet.name}</h1>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Delete this pet?")) deletePet.mutate(); }}><Trash2 className="h-4 w-4" /></Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-5xl">
              {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} className="h-20 w-20 rounded-full object-cover" /> : (speciesEmoji[pet.species] || "🐾")}
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-black">{pet.name}</h2>
              <p className="text-sm text-muted-foreground">{pet.breed || pet.species}</p>
              <div className="mt-2 flex gap-2">
                <PillBadge>{pet.species}</PillBadge>
                <PillBadge variant="muted">{pet.gender === "male" ? "♂️" : pet.gender === "female" ? "♀️" : "⚧"} {pet.gender}</PillBadge>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-heading text-lg font-black text-primary">{petAge(pet.dob)}</p>
              <p className="text-xs text-muted-foreground">Age</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-heading text-lg font-black text-primary">{pet.weight ? `${pet.weight}kg` : "—"}</p>
              <p className="text-xs text-muted-foreground">Weight</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-heading text-lg font-black text-primary">{healthScore}%</p>
              <p className="text-xs text-muted-foreground">Health</p>
            </div>
          </div>
          <div className="mt-3"><Progress value={healthScore} className="h-2" /></div>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="health" className="flex-1"><Heart className="mr-1 h-3.5 w-3.5" /> Health</TabsTrigger>
          <TabsTrigger value="feeding" className="flex-1"><Utensils className="mr-1 h-3.5 w-3.5" /> Feeding</TabsTrigger>
          <TabsTrigger value="records" className="flex-1"><FileText className="mr-1 h-3.5 w-3.5" /> Records</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-base font-bold flex items-center gap-1.5"><Syringe className="h-4 w-4 text-primary" /> Vaccines</h3>
              <Dialog open={vaccineOpen} onOpenChange={setVaccineOpen}>
                <DialogTrigger asChild><Button size="sm" variant="ghost"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Vaccine</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Vaccine Name *</Label><Input value={vName} onChange={e => setVName(e.target.value)} placeholder="e.g. Rabies" /></div>
                    <div><Label>Date Given</Label><Input type="date" value={vDate} onChange={e => setVDate(e.target.value)} /></div>
                    <div><Label>Next Due</Label><Input type="date" value={vNext} onChange={e => setVNext(e.target.value)} /></div>
                    <div><Label>Administered By</Label><Input value={vBy} onChange={e => setVBy(e.target.value)} placeholder="e.g. Dr. Santos" /></div>
                    <Button onClick={() => addVaccine.mutate()} disabled={!vName} className="w-full rounded-full">Add Vaccine</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {vaccines.length === 0 && <p className="text-sm text-muted-foreground">No vaccines recorded yet.</p>}
              {vaccines.map((v) => {
                const status = getVaccineStatus(v.next_due);
                return (
                  <Card key={v.id} className="shadow-card">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{v.vaccine_name}</p>
                        <p className="text-xs text-muted-foreground">Given: {v.date_given || "—"}</p>
                      </div>
                      <div className="text-right">
                        <PillBadge variant={status === "up-to-date" ? "success" : status === "due-soon" ? "warning" : "destructive"}>
                          {status === "up-to-date" ? "✅ Up to date" : status === "due-soon" ? "⚠️ Due soon" : "❌ Overdue"}
                        </PillBadge>
                        {v.next_due && <p className="text-xs text-muted-foreground mt-1">Next: {v.next_due}</p>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-base font-bold flex items-center gap-1.5"><Pill className="h-4 w-4 text-accent" /> Medications</h3>
              <Dialog open={medOpen} onOpenChange={setMedOpen}>
                <DialogTrigger asChild><Button size="sm" variant="ghost"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Medication Name *</Label><Input value={mName} onChange={e => setMName(e.target.value)} placeholder="e.g. Heartgard" /></div>
                    <div><Label>Dosage</Label><Input value={mDosage} onChange={e => setMDosage(e.target.value)} placeholder="e.g. 1 chew" /></div>
                    <div><Label>Frequency</Label><Input value={mFreq} onChange={e => setMFreq(e.target.value)} placeholder="e.g. Monthly" /></div>
                    <Button onClick={() => addMed.mutate()} disabled={!mName} className="w-full rounded-full">Add Medication</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {medications.length === 0 && <p className="text-sm text-muted-foreground">No medications recorded yet.</p>}
              {medications.map((m) => (
                <Card key={m.id} className="shadow-card">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{m.med_name}</p>
                      <p className="text-xs text-muted-foreground">{m.dosage || "—"} — {m.frequency || "—"}</p>
                    </div>
                    <PillBadge variant={m.active ? "success" : "muted"}>{m.active ? "Active" : "Inactive"}</PillBadge>
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
