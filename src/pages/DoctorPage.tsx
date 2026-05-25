import {
  Stethoscope, Users, Calendar, CheckCircle2, XCircle, Clock3,
  Activity, PawPrint, User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { PillBadge } from "@/components/ui/pill-badge";
import { PageHeader } from "@/components/ui/page-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const statusVariant = {
  pending: "warning" as const,
  confirmed: "default" as const,
  completed: "success" as const,
  cancelled: "destructive" as const,
};

export default function DoctorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isDoctor, isLoading: roleLoading } = useQuery({
    queryKey: ["is-doctor", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "vet");
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user,
    retry: false,
  });

  const { data: doctorProfile } = useQuery({
    queryKey: ["doctor-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user && isDoctor === true,
  });

  const { data: appointments = [], isLoading: apptLoading } = useQuery({
    queryKey: ["doctor-appointments", user?.id],
    queryFn: async () => {
      const { data: appts, error } = await supabase
        .from("appointments")
        .select("*, pets(name, species, breed), vet_clinics(name)")
        .eq("doctor_id", user!.id)
        .order("date", { ascending: true });
      if (error) throw error;
      if (!appts || appts.length === 0) return [];
      const userIds = [...new Set(appts.map((a: any) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      const profileMap: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = p.name; });
      return appts.map((a: any) => ({ ...a, ownerName: profileMap[a.user_id] || "Unknown Patient" }));
    },
    enabled: !!user && isDoctor === true,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .eq("doctor_id", user!.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast({
        title: vars.status === "confirmed" ? "✅ Appointment Accepted!" : vars.status === "completed" ? "🎉 Marked as Completed!" : "❌ Appointment Declined",
        description: `Status updated to ${vars.status}.`,
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (roleLoading) return <div className="container mx-auto max-w-6xl px-4 py-4"><LoadingCard /></div>;
  if (!isDoctor) return <Navigate to="/home" replace />;

  const pending = appointments.filter((a: any) => a.status === "pending");
  const confirmed = appointments.filter((a: any) => a.status === "confirmed");
  const history = appointments.filter((a: any) => a.status === "completed" || a.status === "cancelled");
  const uniquePatients = [...new Map(appointments.map((a: any) => [a.user_id, a])).values()];
  const today = new Date().toISOString().split("T")[0];
  const todayCount = appointments.filter((a: any) => a.date === today && a.status === "confirmed").length;

  const stats = [
    { label: "My Patients", value: uniquePatients.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Requests", value: pending.length.toString(), icon: Clock3, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Today's Appts", value: todayCount.toString(), icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completed", value: history.filter((a: any) => a.status === "completed").length.toString(), icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const doctorLastName = doctorProfile?.name?.split(" ").slice(-1)[0] ?? "Doctor";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
      <PageHeader title={`Dr. ${doctorLastName}'s Panel 🩺`} subtitle="Manage your patients and appointments" gradient />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-2 font-heading text-2xl font-black">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="requests" className="mt-6">
        <TabsList>
          <TabsTrigger value="requests">
            <Clock3 className="mr-1.5 h-3.5 w-3.5" />
            Requests
            {pending.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirmed ({confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="patients">
            <Users className="mr-1.5 h-3.5 w-3.5" /> Patients ({uniquePatients.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Activity className="mr-1.5 h-3.5 w-3.5" /> History
          </TabsTrigger>
        </TabsList>

        {/* Requests */}
        <TabsContent value="requests" className="mt-4">
          {apptLoading ? <LoadingCard /> : pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-3 font-heading text-base font-bold">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending appointment requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((a: any, i: number) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="shadow-card border-l-4 border-l-amber-400">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <PawPrint className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-heading font-bold">{a.ownerName}</p>
                            <p className="text-sm text-muted-foreground">
                              Pet: <span className="font-medium text-foreground">{a.pets?.name ?? "—"}</span>
                              {a.pets?.breed ? ` (${a.pets.breed})` : ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {a.reason || "General Visit"} — {a.date} at {a.time?.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            id={`accept-${a.id}`}
                            className="rounded-full bg-green-500 hover:bg-green-600 text-white gap-1"
                            onClick={() => updateStatus.mutate({ id: a.id, status: "confirmed" })}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            id={`decline-${a.id}`}
                            className="rounded-full border-red-400 text-red-500 hover:bg-red-50 gap-1"
                            onClick={() => updateStatus.mutate({ id: a.id, status: "cancelled" })}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Confirmed */}
        <TabsContent value="confirmed" className="mt-4">
          {apptLoading ? <LoadingCard /> : confirmed.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No confirmed appointments.</p>
          ) : (
            <ApptTable appointments={confirmed} onUpdate={updateStatus.mutate} isPending={updateStatus.isPending} showComplete />
          )}
        </TabsContent>

        {/* Patients */}
        <TabsContent value="patients" className="mt-4">
          {apptLoading ? <LoadingCard /> : uniquePatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-3 font-heading text-base font-bold">No patients yet</p>
              <p className="text-sm text-muted-foreground">Patients appear once they book with you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uniquePatients.map((a: any, i: number) => {
                const patientAppts = appointments.filter((apt: any) => apt.user_id === a.user_id);
                const latest = patientAppts[patientAppts.length - 1];
                return (
                  <motion.div key={a.user_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                              <User className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-heading font-bold">{a.ownerName}</p>
                              <p className="text-sm text-muted-foreground">{patientAppts.length} appointment{patientAppts.length !== 1 ? "s" : ""}</p>
                              {latest?.pets?.name && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <PawPrint className="h-3 w-3" /> {latest.pets.name}{latest.pets.breed ? ` · ${latest.pets.breed}` : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Last visit</p>
                            <p className="font-medium text-foreground">{latest?.date ?? "—"}</p>
                            <PillBadge variant={statusVariant[latest?.status as keyof typeof statusVariant] ?? "muted"} className="mt-1">
                              {latest?.status}
                            </PillBadge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-4">
          {apptLoading ? <LoadingCard /> : history.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <ApptTable appointments={history} onUpdate={updateStatus.mutate} isPending={updateStatus.isPending} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApptTable({ appointments, onUpdate, isPending, showComplete = false }: {
  appointments: any[]; onUpdate: (v: { id: string; status: string }) => void; isPending: boolean; showComplete?: boolean;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-heading font-bold">Patient</th>
                <th className="px-4 py-3 text-left font-heading font-bold">Pet</th>
                <th className="px-4 py-3 text-left font-heading font-bold">Reason</th>
                <th className="px-4 py-3 text-left font-heading font-bold">Date & Time</th>
                <th className="px-4 py-3 text-left font-heading font-bold">Status</th>
                <th className="px-4 py-3 text-left font-heading font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a: any) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{a.ownerName}</td>
                  <td className="px-4 py-3">{a.pets?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.reason || "Visit"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div>{a.date}</div><div>{a.time?.slice(0, 5)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <PillBadge variant={statusVariant[a.status as keyof typeof statusVariant] ?? "muted"}>
                      {(a.status as string)?.charAt(0).toUpperCase() + (a.status as string)?.slice(1)}
                    </PillBadge>
                  </td>
                  <td className="px-4 py-3">
                    {showComplete && a.status === "confirmed" ? (
                      <Button size="sm" variant="outline" className="h-7 rounded-full border-blue-400 text-blue-500 hover:bg-blue-50 text-xs px-2"
                        onClick={() => onUpdate({ id: a.id, status: "completed" })} disabled={isPending}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
