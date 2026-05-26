import { Users, PawPrint, ShoppingBag, Calendar, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { PillBadge } from "@/components/ui/pill-badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const statusVariant = {
  pending: "warning" as const,
  confirmed: "default" as const,
  completed: "success" as const,
  cancelled: "destructive" as const,
};

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user,
    retry: false,
  });

  const { data: profileCount = 0 } = useQuery({
    queryKey: ["admin-profile-count"],
    queryFn: async () => { const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }); return count ?? 0; },
    enabled: isAdmin === true,
  });

  const { data: petCount = 0 } = useQuery({
    queryKey: ["admin-pet-count"],
    queryFn: async () => { const { count } = await supabase.from("pets").select("*", { count: "exact", head: true }); return count ?? 0; },
    enabled: isAdmin === true,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => { const { data } = await supabase.from("services").select("*").order("name"); return data ?? []; },
    enabled: isAdmin === true,
  });

  const { data: appointments = [], isLoading: apptLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data: appts } = await supabase
        .from("appointments")
        .select("*, pets(name), vet_clinics(name)")
        .order("date", { ascending: true });
      if (!appts || appts.length === 0) return [];

      // Fetch owner names from profiles by user_id
      const userIds = [...new Set(appts.map((a: any) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      const profileMap: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = p.name; });

      return appts.map((a: any) => ({ ...a, ownerName: profileMap[a.user_id] || "Unknown" }));
    },
    enabled: isAdmin === true,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: vars.status === "confirmed" ? "✅ Appointment Confirmed!" : vars.status === "completed" ? "🎉 Marked as Completed!" : "❌ Appointment Cancelled",
        description: `Status updated to ${vars.status}.`,
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (roleLoading) return <div className="container mx-auto max-w-6xl px-4 py-4"><LoadingCard /></div>;
  if (roleError) return (
    <div className="container mx-auto max-w-6xl px-4 py-4">
      <Card className="shadow-card">
        <CardContent>
          <h2 className="text-xl font-heading font-bold">Admin access error</h2>
          <p className="mt-2 text-sm text-destructive">{roleError.message}</p>
          <p className="mt-2 text-sm text-muted-foreground">Please make sure the admin user has the correct role in <code>public.user_roles</code>.</p>
        </CardContent>
      </Card>
    </div>
  );
  if (!isAdmin) return <Navigate to="/home" replace />;

  const pendingCount = appointments.filter((a: any) => a.status === "pending").length;

  const stats = [
    { label: "Total Users", value: profileCount.toString(), icon: Users },
    { label: "Total Pets", value: petCount.toString(), icon: PawPrint },
    { label: "Services", value: services.length.toString(), icon: ShoppingBag },
    { label: "Pending Appointments", value: pendingCount.toString(), icon: Calendar },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
      <PageHeader title="Admin Panel 🔧" subtitle="Platform management" gradient />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-4">
              <stat.icon className="h-5 w-5 text-primary" />
              <p className="mt-2 font-heading text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="appointments" className="mt-6">
        <TabsList>
          <TabsTrigger value="appointments">
            <Calendar className="mr-1 h-3.5 w-3.5" /> Appointments
            {pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="services"><ShoppingBag className="mr-1 h-3.5 w-3.5" /> Services</TabsTrigger>
        </TabsList>

        {/* ── Appointments Tab ── */}
        <TabsContent value="appointments" className="mt-4">
          {apptLoading ? (
            <LoadingCard />
          ) : appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No appointments yet.</p>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 py-3 text-left font-heading font-bold">Owner</th>
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
                          <td className="px-4 py-3 font-medium">{a.ownerName || "—"}</td>
                          <td className="px-4 py-3">{a.pets?.name || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{a.reason || "Visit"}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            <div>{a.date}</div>
                            <div>{a.time?.slice(0, 5)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <PillBadge variant={statusVariant[a.status as keyof typeof statusVariant] || "muted"}>
                              {(a.status as string)?.charAt(0).toUpperCase() + (a.status as string)?.slice(1)}
                            </PillBadge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {a.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-full border-green-500 text-green-600 hover:bg-green-50 text-xs px-2"
                                  onClick={() => updateStatus.mutate({ id: a.id, status: "confirmed" })}
                                  disabled={updateStatus.isPending}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                                </Button>
                              )}
                              {(a.status === "pending" || a.status === "confirmed") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50 text-xs px-2"
                                  onClick={() => updateStatus.mutate({ id: a.id, status: "completed" })}
                                  disabled={updateStatus.isPending}
                                >
                                  <Clock3 className="h-3 w-3 mr-1" /> Complete
                                </Button>
                              )}
                              {a.status !== "cancelled" && a.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-full border-red-400 text-red-500 hover:bg-red-50 text-xs px-2"
                                  onClick={() => updateStatus.mutate({ id: a.id, status: "cancelled" })}
                                  disabled={updateStatus.isPending}
                                >
                                  <XCircle className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                              )}
                              {(a.status === "cancelled" || a.status === "completed") && (
                                <span className="text-xs text-muted-foreground italic">No actions</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Services Tab ── */}
        <TabsContent value="services" className="mt-4">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-heading font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Category</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Location</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Price</th>
                      <th className="px-4 py-3 text-left font-heading font-bold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s: any) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3"><span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">{s.category}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{s.location || "—"}</td>
                        <td className="px-4 py-3">{s.price || "—"}</td>
                        <td className="px-4 py-3">{s.rating || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
