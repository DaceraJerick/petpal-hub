import { PawPrint, Utensils, Stethoscope, Scissors, Bell, ChevronRight, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { Progress } from "@/components/ui/progress";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const quickActions = [
  { icon: Utensils, label: "Feed", color: "text-primary", bg: "bg-primary-light", path: "/pets" },
  { icon: Stethoscope, label: "Vet", color: "text-accent", bg: "bg-accent/10", path: "/appointments/new" },
  { icon: Heart, label: "Medicine", color: "text-destructive", bg: "bg-destructive/10", path: "/pets" },
  { icon: Scissors, label: "Grooming", color: "text-warning-foreground", bg: "bg-warning/20", path: "/services" },
];

const speciesEmoji: Record<string, string> = { Dog: "🐕", Cat: "🐈", Bird: "🐦", Fish: "🐟" };

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("name").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["pets", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("pets").select("*").eq("user_id", user!.id).order("created_at");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: todayAppts = [] } = useQuery({
    queryKey: ["today-appointments", user?.id, today],
    queryFn: async () => {
      const { data } = await supabase.from("appointments").select("*, pets(name)").eq("user_id", user!.id).eq("date", today).order("time");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("read", false);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: upcomingAppts = [] } = useQuery({
    queryKey: ["upcoming-7d", user?.id],
    queryFn: async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data } = await supabase.from("appointments").select("*, pets(name)").eq("user_id", user!.id).gt("date", today).lte("date", format(nextWeek, "yyyy-MM-dd")).in("status", ["pending", "confirmed"]).order("date");
      return data ?? [];
    },
    enabled: !!user,
  });

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title={`${greeting}! 🌞`} subtitle={`Here's what's happening with your pets today`} gradient>
        <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")} className="relative text-primary-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">{unreadCount}</span>}
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <motion.button key={action.label} whileTap={{ scale: 0.95 }} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-elevated">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action.bg}`}><action.icon className={`h-5 w-5 ${action.color}`} /></div>
            <span className="text-xs font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-extrabold">My Pets</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/pets")} className="text-primary text-xs">View All <ChevronRight className="ml-0.5 h-3 w-3" /></Button>
        </div>
        {petsLoading ? <LoadingCard /> : pets.length === 0 ? (
          <Card className="shadow-card"><CardContent className="p-4 text-center text-sm text-muted-foreground">No pets yet. <Button variant="link" onClick={() => navigate("/pets/new")} className="text-primary p-0">Add one!</Button></CardContent></Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {pets.map((pet) => (
              <Card key={pet.id} className="min-w-[200px] snap-start cursor-pointer shadow-card transition-shadow hover:shadow-elevated" onClick={() => navigate(`/pets/${pet.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-2xl">
                      {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} className="h-12 w-12 rounded-full object-cover" /> : (speciesEmoji[pet.species] || "🐾")}
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground">{pet.breed || pet.species}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {todayAppts.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-extrabold mb-3">Today's Appointments</h2>
          <div className="space-y-2">
            {todayAppts.map((appt: any, i: number) => (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card">
                <span className="min-w-[60px] text-xs font-medium text-muted-foreground">{appt.time?.slice(0, 5)}</span>
                <div className="flex-1"><p className="text-sm font-medium">{appt.pets?.name}'s {appt.reason || "Visit"}</p></div>
                <PillBadge variant={appt.status === "confirmed" ? "default" : "warning"}>{appt.status}</PillBadge>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {upcomingAppts.length > 0 && (
        <section className="mt-8 mb-8">
          <h2 className="font-heading text-lg font-extrabold mb-3">Upcoming (Next 7 Days)</h2>
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              {upcomingAppts.map((appt: any) => (
                <div key={appt.id} className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{appt.pets?.name}'s {appt.reason || "Appointment"}</p>
                    <p className="text-xs text-muted-foreground">{appt.date} — {appt.time?.slice(0, 5)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
