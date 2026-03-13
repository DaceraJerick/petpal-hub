import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const statusVariant = { pending: "warning" as const, confirmed: "default" as const, completed: "success" as const, cancelled: "destructive" as const };

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, pets(name), vet_clinics(name)")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const upcoming = appointments.filter((a: any) => a.status === "confirmed" || a.status === "pending");
  const past = appointments.filter((a: any) => a.status === "completed" || a.status === "cancelled");

  if (isLoading) return <div className="container mx-auto max-w-5xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title="Appointments 🏥" subtitle="Manage your vet visits">
        <Button onClick={() => navigate("/appointments/new")} className="rounded-full" size="sm">
          <Plus className="mr-1 h-4 w-4" /> Book
        </Button>
      </PageHeader>

      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No upcoming appointments.</p>}
          {upcoming.map((appt: any, i: number) => <ApptCard key={appt.id} appt={appt} index={i} />)}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No past appointments.</p>}
          {past.map((appt: any, i: number) => <ApptCard key={appt.id} appt={appt} index={i} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApptCard({ appt, index }: { appt: any; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading font-bold">{appt.pets?.name}'s {appt.reason || "Visit"}</h3>
              <p className="text-sm text-muted-foreground">{appt.vet_name || "—"} — {appt.vet_clinics?.name || "—"}</p>
            </div>
            <PillBadge variant={statusVariant[appt.status as keyof typeof statusVariant] || "muted"}>
              {(appt.status as string)?.charAt(0).toUpperCase() + (appt.status as string)?.slice(1)}
            </PillBadge>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {appt.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {appt.time?.slice(0, 5)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
