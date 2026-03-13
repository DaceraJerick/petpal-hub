import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PillBadge } from "@/components/ui/pill-badge";
import { LoadingCard } from "@/components/ui/loading-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const nutritionTips = [
  "🥕 Labradors benefit from omega-3 fatty acids for healthy joints",
  "💧 Always ensure fresh water is available throughout the day",
  "🍖 Avoid feeding grapes, chocolate, and onions to dogs",
  "🐟 Fish oil supplements support healthy skin and coat",
  "🥩 Maintain consistent feeding times for better digestion",
];

export default function FeedingManagerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [addOpen, setAddOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [portion, setPortion] = useState("");
  const [foodType, setFoodType] = useState("");

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["feeding-schedules", id],
    queryFn: async () => {
      const { data } = await supabase.from("feeding_schedules").select("*").eq("pet_id", id!).eq("active", true).order("time");
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["feeding-logs", id, today],
    queryFn: async () => {
      if (schedules.length === 0) return [];
      const ids = schedules.map(s => s.id);
      const { data } = await supabase.from("feeding_logs").select("*").in("schedule_id", ids).eq("date", today);
      return data ?? [];
    },
    enabled: schedules.length > 0,
  });

  const completedIds = new Set(todayLogs.filter(l => l.given_at && !l.skipped).map(l => l.schedule_id));
  const completedCount = completedIds.size;
  const progress = schedules.length > 0 ? (completedCount / schedules.length) * 100 : 0;

  const toggleMeal = useMutation({
    mutationFn: async (scheduleId: string) => {
      const existing = todayLogs.find(l => l.schedule_id === scheduleId);
      if (existing) {
        await supabase.from("feeding_logs").delete().eq("id", existing.id);
      } else {
        await supabase.from("feeding_logs").insert({ schedule_id: scheduleId, date: today, given_at: new Date().toISOString(), skipped: false });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feeding-logs", id, today] }),
  });

  const addSchedule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feeding_schedules").insert({ pet_id: id!, meal_name: mealName, time: mealTime, portion: portion || null, food_type: foodType || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeding-schedules", id] });
      setAddOpen(false);
      setMealName(""); setMealTime(""); setPortion(""); setFoodType("");
      toast({ title: "Meal added ✅" });
    },
  });

  if (isLoading) return <div className="container mx-auto max-w-3xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/pets/${id}`)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-heading text-xl font-black flex-1">Feeding Plan</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button size="sm" className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add Meal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Meal Schedule</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Meal Name *</Label><Input value={mealName} onChange={e => setMealName(e.target.value)} placeholder="e.g. Breakfast" /></div>
              <div><Label>Time *</Label><Input type="time" value={mealTime} onChange={e => setMealTime(e.target.value)} /></div>
              <div><Label>Portion</Label><Input value={portion} onChange={e => setPortion(e.target.value)} placeholder="e.g. 1 cup" /></div>
              <div>
                <Label>Food Type</Label>
                <Select value={foodType} onValueChange={setFoodType}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dry Kibble">Dry Kibble</SelectItem>
                    <SelectItem value="Wet Food">Wet Food</SelectItem>
                    <SelectItem value="Raw Food">Raw Food</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => addSchedule.mutate()} disabled={!mealName || !mealTime} className="w-full rounded-full">Add Meal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="font-heading text-lg font-black text-primary">{completedCount}/{schedules.length}</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="mt-1 text-xs text-muted-foreground">
            {completedCount === schedules.length && schedules.length > 0 ? "🎉 All meals completed!" : `${schedules.length - completedCount} meals remaining`}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {schedules.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No meals scheduled. Add one above!</p>}
        {schedules.map((schedule, i) => {
          const isDone = completedIds.has(schedule.id);
          return (
            <motion.div key={schedule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`shadow-card transition-all ${isDone ? "opacity-70" : ""}`}>
                <CardContent className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleMeal.mutate(schedule.id)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isDone ? "border-success bg-success text-success-foreground" : "border-border hover:border-primary"}`}>
                    {isDone ? <Check className="h-5 w-5" /> : null}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-heading font-bold ${isDone ? "line-through" : ""}`}>{schedule.meal_name}</h3>
                      <PillBadge variant="muted">{schedule.time?.slice(0, 5)}</PillBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">{schedule.food_type || "—"} — {schedule.portion || "—"}</p>
                  </div>
                  {isDone && <PillBadge variant="success">Fed ✅</PillBadge>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-base font-bold mb-3">💡 Nutrition Tips</h2>
        <div className="space-y-2">
          {nutritionTips.map((tip, i) => (
            <Card key={i} className="shadow-card"><CardContent className="p-3"><p className="text-sm">{tip}</p></CardContent></Card>
          ))}
        </div>
      </section>
    </div>
  );
}
