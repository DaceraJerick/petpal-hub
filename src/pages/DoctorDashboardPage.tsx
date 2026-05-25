import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Stethoscope, LogOut, Calendar, Clock, PawPrint, Phone, CheckCircle2, XCircle, CheckCheck, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PillBadge } from "@/components/ui/pill-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { useToast } from "@/hooks/use-toast";

const statusVariant: Record<string, any> = {
  pending: "warning",
  accepted: "default",
  completed: "success",
  rejected: "destructive",
};

export default function DoctorDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: doctor } = useQuery({
    queryKey: ["doctor-self", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const doctorId = doctor?.id;

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["doctor-appointments", doctorId],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, pets(name, species, breed, photo_url), profiles:user_id(name, contact_number)")
        .eq("doctor_id", doctorId!)
        .order("date", { ascending: false })
        .order("time", { ascending: false });
      // profiles foreign-relation may not auto-resolve via user_id without FK; fallback fetch
      return data ?? [];
    },
    enabled: !!doctorId,
  });

  // Fallback: load client profiles separately (since no FK between appointments.user_id and profiles.user_id)
  const clientIds = useMemo(
    () => Array.from(new Set(appointments.map((a: any) => a.user_id))),
    [appointments]
  );
  const { data: clientProfiles = [] } = useQuery({
    queryKey: ["doctor-clients", clientIds.join(",")],
    queryFn: async () => {
      if (clientIds.length === 0) return [];
      const { data } = await supabase.from("profiles").select("user_id, name, contact_number").in("user_id", clientIds);
      return data ?? [];
    },
    enabled: clientIds.length > 0,
  });
  const profileMap = useMemo(() => {
    const m: Record<string, any> = {};
    clientProfiles.forEach((p: any) => { m[p.user_id] = p; });
    return m;
  }, [clientProfiles]);

  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`appts-doctor-${doctorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `doctor_id=eq.${doctorId}` }, () => {
        qc.invalidateQueries({ queryKey: ["doctor-appointments", doctorId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [doctorId, qc]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status: status as any }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Appointment ${status}` });
      qc.invalidateQueries({ queryKey: ["doctor-appointments", doctorId] });
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const pending = appointments.filter((a: any) => a.status === "pending");
  const upcoming = appointments.filter((a: any) => a.status === "accepted" && a.date >= today);
  const history = appointments.filter((a: any) => ["completed", "rejected"].includes(a.status) || (a.status === "accepted" && a.date < today));
  const todayCount = appointments.filter((a: any) => a.date === today && a.status === "accepted").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-header">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-black leading-tight">Doctor Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {doctor ? `Dr. ${doctor.full_name}` : "Loading..."}
                {doctor?.specialization && ` · ${doctor.specialization}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/login"); }}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Inbox} label="Pending" value={pending.length} tone="warning" />
          <StatCard icon={Calendar} label="Today" value={todayCount} tone="primary" />
          <StatCard icon={CheckCircle2} label="Accepted" value={upcoming.length} tone="success" />
          <StatCard icon={CheckCheck} label="Total" value={appointments.length} tone="muted" />
        </div>

        {isLoading ? (
          <><LoadingCard /><LoadingCard /></>
        ) : (
          <Tabs defaultValue="requests">
            <TabsList className="w-full">
              <TabsTrigger value="requests" className="flex-1">Requests ({pending.length})</TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History ({history.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="mt-4 space-y-3">
              {pending.length === 0 && <EmptyState text="No pending requests." />}
              {pending.map((a: any, i: number) => (
                <ApptRow key={a.id} appt={a} client={profileMap[a.user_id]} index={i}
                  actions={
                    <>
                      <Button size="sm" className="rounded-full" onClick={() => updateStatus(a.id, "accepted")}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(a.id, "rejected")}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4 space-y-3">
              {upcoming.length === 0 && <EmptyState text="No upcoming appointments." />}
              {upcoming.map((a: any, i: number) => (
                <ApptRow key={a.id} appt={a} client={profileMap[a.user_id]} index={i}
                  actions={
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(a.id, "completed")}>
                      <CheckCheck className="h-4 w-4 mr-1" /> Mark completed
                    </Button>
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {history.length === 0 && <EmptyState text="No history yet." />}
              {history.map((a: any, i: number) => (
                <ApptRow key={a.id} appt={a} client={profileMap[a.user_id]} index={i} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: any) {
  const toneClass = {
    warning: "bg-warning/15 text-warning-foreground",
    primary: "bg-primary-light text-primary",
    success: "bg-success/15 text-success-foreground",
    muted: "bg-muted text-muted-foreground",
  }[tone as string];
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-2xl font-heading font-black">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function ApptRow({ appt, client, index, actions }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-bold truncate">{client?.name || "Client"}</h3>
                <PillBadge variant={statusVariant[appt.status] || "muted"}>
                  {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
                </PillBadge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {client?.contact_number && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.contact_number}</span>}
                <span className="flex items-center gap-1"><PawPrint className="h-3 w-3" /> {appt.pets?.name} ({appt.pets?.species}{appt.pets?.breed ? ` · ${appt.pets.breed}` : ""})</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {appt.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.time?.slice(0, 5)}</span>
              </div>
              {appt.reason && <p className="mt-2 text-sm">{appt.reason}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
