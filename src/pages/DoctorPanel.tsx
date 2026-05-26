import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingCard } from "@/components/ui/loading-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, CheckCheck, Calendar, User, Phone, FileText } from "lucide-react";

const statusColors: { [key: string]: string } = {
  pending: "bg-yellow-50 border-yellow-200",
  confirmed: "bg-blue-50 border-blue-200",
  accepted: "bg-green-50 border-green-200",
  rejected: "bg-red-50 border-red-200",
  completed: "bg-gray-50 border-gray-200",
  cancelled: "bg-red-100 border-red-300"
};

const statusIcons: { [key: string]: any } = {
  pending: Clock,
  confirmed: Calendar,
  accepted: CheckCircle,
  rejected: XCircle,
  completed: CheckCheck,
  cancelled: XCircle
};

export default function DoctorPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: doctorProfile } = useQuery({
    queryKey: ["doctor-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["doctor-appointments", doctorProfile?.id],
    queryFn: async () => {
      if (!doctorProfile?.id) return [];
      const { data } = await supabase
        .from("appointments")
        .select("*, pets(name, species, breed), profiles(name, contact_number)")
        .eq("doctor_id", doctorProfile.id)
        .order("date", { ascending: false });
      return data ?? [];
    },
    enabled: !!doctorProfile?.id,
  });

  const stats = useMemo(() => ({
    pending: appointments.filter((a: any) => a.status === "pending").length,
    accepted: appointments.filter((a: any) => a.status === "accepted").length,
    rejected: appointments.filter((a: any) => a.status === "rejected").length,
    completed: appointments.filter((a: any) => a.status === "completed").length,
  }), [appointments]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("appointments").update({ status: newStatus as any }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["doctor-appointments", doctorProfile?.id] });
    queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
  };


  const groupedAppointments = useMemo(() => ({
    pending: appointments.filter((a: any) => a.status === "pending"),
    accepted: appointments.filter((a: any) => a.status === "accepted"),
    rejected: appointments.filter((a: any) => a.status === "rejected"),
    completed: appointments.filter((a: any) => a.status === "completed"),
  }), [appointments]);

  if (isLoading) return <div className="container mx-auto max-w-6xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
      <PageHeader 
        title="Doctor Dashboard 🏥" 
        subtitle={doctorProfile?.specialization ? `${doctorProfile.specialization} • ${doctorProfile.clinic_address}` : "Manage your appointments"}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending Requests</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="pending" className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        {["pending", "accepted", "completed", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="mt-4 space-y-3">
            {groupedAppointments[status as keyof typeof groupedAppointments].length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No {status} appointments.</p>
            ) : (
              groupedAppointments[status as keyof typeof groupedAppointments].map((appt: any, i: number) => {
                const StatusIcon = statusIcons[appt.status];
                return (
                  <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`shadow-card border-l-4 cursor-pointer transition-all ${statusColors[appt.status]}`} onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg"><StatusIcon className="h-5 w-5 text-primary" /></div>
                            <div>
                              <h3 className="font-bold">{appt.pets?.name}'s {appt.reason || "Appointment"}</h3>
                              <p className="text-xs text-muted-foreground">{appt.pets?.species} • {appt.pets?.breed}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{appt.status.toUpperCase()}</Badge>
                        </div>

                        {expandedId === appt.id && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Owner</p>
                                  <p className="text-sm font-medium">{appt.profiles?.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Date & Time</p>
                                  <p className="text-sm font-medium">{appt.date} {appt.time?.slice(0, 5)}</p>
                                </div>
                              </div>
                            </div>

                            {appt.reason && (
                              <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                <p>{appt.reason}</p>
                              </div>
                            )}

                            {appt.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => updateStatus(appt.id, "accepted")} className="flex-1 rounded-full">
                                  ✓ Accept
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => updateStatus(appt.id, "rejected")} className="flex-1 rounded-full">
                                  ✕ Reject
                                </Button>
                              </div>
                            )}

                            {appt.status === "accepted" && (
                              <Button size="sm" onClick={() => updateStatus(appt.id, "completed")} className="w-full rounded-full">
                                Mark Completed ✓
                              </Button>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
