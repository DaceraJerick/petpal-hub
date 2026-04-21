import { Users, PawPrint, Calendar, ShoppingBag, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AdminPage() {
  const { user } = useAuth();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user,
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

  if (roleLoading) return <div className="container mx-auto max-w-6xl px-4 py-4"><LoadingCard /></div>;
  if (!isAdmin) return <Navigate to="/home" replace />;

  const stats = [
    { label: "Total Users", value: profileCount.toString(), icon: Users },
    { label: "Total Pets", value: petCount.toString(), icon: PawPrint },
    { label: "Services", value: services.length.toString(), icon: ShoppingBag },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
      <PageHeader title="Admin Panel 🔧" subtitle="Platform management" gradient />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
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

      <Tabs defaultValue="services" className="mt-6">
        <TabsList>
          <TabsTrigger value="services"><ShoppingBag className="mr-1 h-3.5 w-3.5" /> Services</TabsTrigger>
        </TabsList>
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
