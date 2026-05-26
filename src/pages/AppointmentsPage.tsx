import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, Stethoscope, XCircle, FileText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const statusVariant: Record<string, any> = {
  pending: "warning",
  accepted: "default",
  confirmed: "default",
  completed: "success",
  rejected: "destructive",
  cancelled: "destructive",
};

const ACTIVE_STATUSES = ["pending", "accepted", "confirmed"];
const PAST_STATUSES = ["completed", "cancelled", "rejected"];

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
        .select("*, pets(name, species), vet_clinics(name, address), doctors(full_name, specialization, clinic_address)")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
  });

  // Realtime subscription for live status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`appointments-owner-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["appointments", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const cancelAppt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" as any })
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("status", "pending" as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment Cancelled", description: "Your appointment has been cancelled." });
    },
    onError: (err: any) => {
      toast({ title: "Cannot cancel", description: err.message, variant: "destructive" });
    },
  });

  const upcoming = appointments.filter((a: any) => ACTIVE_STATUSES.includes(a.status));
  const past = appointments.filter((a: any) => PAST_STATUSES.includes(a.status));

  if (isLoading) return <div className="container mx-auto max-w-5xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader title="My Appointments 🏥" subtitle="All your booked vet visits">
        <Button onClick={() => navigate("/appointments/new")} className="rounded-full" size="sm">
          <Plus className="mr-1 h-4 w-4" /> Book
        </Button>
      </PageHeader>

      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">Active ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">History ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 && (
            <EmptyState onBook={() => navigate("/appointments/new")} />
          )}
          {upcoming.map((appt: any, i: number) => (
            <ApptCard key={appt.id} appt={appt} index={i} onCancel={cancelAppt.mutate} isPending={cancelAppt.isPending} />
          ))}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No past appointments.</p>}
          {past.map((appt: any, i: number) => (
            <ApptCard key={appt.id} appt={appt} index={i} onCancel={cancelAppt.mutate} isPending={cancelAppt.isPending} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ onBook }: { onBook: () => void }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-8 text-center">
        <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-heading font-bold mb-1">No active appointments</h3>
        <p className="text-sm text-muted-foreground mb-4">Book a visit with a registered doctor.</p>
        <Button onClick={onBook} className="rounded-full"><Plus className="h-4 w-4 mr-1" /> Book Appointment</Button>
      </CardContent>
    </Card>
  );
}

function ApptCard({ appt, index, onCancel, isPending }: { appt: any; index: number; onCancel: (id: string) => void; isPending: boolean }) {
  const canCancel = appt.status === "pending";
  const doctorName = appt.doctors?.full_name || appt.vet_name || "Doctor";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-heading font-bold truncate">{appt.pets?.name}'s {appt.reason || "Visit"}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
                <Stethoscope className="h-3.5 w-3.5" /> Dr. {doctorName}
                {appt.doctors?.specialization && <span className="text-xs">· {appt.doctors.specialization}</span>}
              </p>
              {appt.doctors?.clinic_address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {appt.doctors.clinic_address}
                </p>
              )}
            </div>
            <PillBadge variant={statusVariant[appt.status] || "muted"}>
              {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
            </PillBadge>
          </div>

          {appt.reason && (
            <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
              <FileText className="h-3 w-3 mt-0.5 shrink-0" /> {appt.reason}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {appt.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {appt.time?.slice(0, 5)}</span>
            </div>
            {canCancel ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 text-xs px-3" disabled={isPending}>
                    <XCircle className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will notify Dr. {doctorName} that you're cancelling. You can rebook anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCancel(appt.id)}>Yes, cancel</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (appt.status === "accepted" || appt.status === "rejected") ? (
              <span className="text-[11px] text-muted-foreground italic">Already processed by doctor</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
