import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { XCircle } from "lucide-react";

const statusVariant: Record<string, any> = {
  pending: "warning",
  accepted: "default",
  confirmed: "default",
  completed: "success",
  rejected: "destructive",
  cancelled: "destructive",
};

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, pets(name), vet_clinics(name), doctors(full_name, specialization)")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const cancelAppt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment Cancelled", description: "The appointment has been successfully cancelled." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
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
          {upcoming.map((appt: any, i: number) => <ApptCard key={appt.id} appt={appt} index={i} onCancel={cancelAppt.mutate} isPending={cancelAppt.isPending} />)}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No past appointments.</p>}
          {past.map((appt: any, i: number) => <ApptCard key={appt.id} appt={appt} index={i} onCancel={cancelAppt.mutate} isPending={cancelAppt.isPending} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApptCard({ appt, index, onCancel, isPending }: { appt: any; index: number; onCancel: (id: string) => void; isPending: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-heading font-bold truncate">{appt.pets?.name}'s {appt.reason || "Visit"}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5" /> {appt.doctors?.full_name || appt.vet_name || "Doctor"}
                {appt.doctors?.specialization && <span className="text-xs">· {appt.doctors.specialization}</span>}
              </p>
            </div>
            <PillBadge variant={statusVariant[appt.status] || "muted"}>
              {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
            </PillBadge>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {appt.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {appt.time?.slice(0, 5)}</span>
            </div>
            {appt.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-full border-red-200 text-red-500 hover:bg-red-50 text-xs px-3"
                onClick={() => onCancel(appt.id)}
                disabled={isPending}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
