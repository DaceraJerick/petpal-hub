import { useNavigate } from "react-router-dom";
import { User, PawPrint, Calendar, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingCard } from "@/components/ui/loading-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: petCount = 0 } = useQuery({
    queryKey: ["pet-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("pets").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: apptCount = 0 } = useQuery({
    queryKey: ["appt-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("appointments").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "See you next time! 🐾" });
    navigate("/");
  };

  const stats = [
    { label: "Pets", value: petCount.toString(), icon: PawPrint },
    { label: "Appointments", value: apptCount.toString(), icon: Calendar },
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <Card className="shadow-card">
        <CardContent className="p-5 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-4xl">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="h-20 w-20 rounded-full object-cover" /> : "👤"}
          </div>
          <h1 className="font-heading text-xl font-black">{profile?.name || "Pet Lover"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-3 text-center">
              <stat.icon className="mx-auto h-5 w-5 text-primary mb-1" />
              <p className="font-heading text-lg font-black text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="mt-6 w-full rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" /> Log Out
      </Button>
    </div>
  );
}
