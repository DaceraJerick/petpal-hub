import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingCard } from "@/components/ui/loading-card";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) return <div className="container mx-auto max-w-3xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <PageHeader title="Notifications 🔔" subtitle={`${unreadCount} unread`}>
        <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} className="text-primary text-xs">
          <Check className="mr-1 h-3.5 w-3.5" /> Mark all read
        </Button>
      </PageHeader>

      <div className="mt-4 space-y-2">
        {notifications.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No notifications yet.</p>}
        {notifications.map((notif, i) => (
          <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`cursor-pointer shadow-card transition-all ${!notif.read ? "border-primary/30 bg-primary-light/30" : ""}`} onClick={() => markRead.mutate(notif.id)}>
              <CardContent className="flex items-center gap-3 p-3">
                {!notif.read && <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? "font-medium" : "text-muted-foreground"}`}>{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
