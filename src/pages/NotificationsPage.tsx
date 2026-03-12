import { useState } from "react";
import { Bell, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { motion } from "framer-motion";

const mockNotifications = [
  { id: "1", type: "feeding", message: "🍖 Time to feed Buddy! (Dinner)", read: false, createdAt: "5 minutes ago" },
  { id: "2", type: "appointment", message: "🏥 Reminder: Luna's vet visit tomorrow at 2:30 PM", read: false, createdAt: "1 hour ago" },
  { id: "3", type: "medication", message: "💊 Buddy needs Heartgard now", read: false, createdAt: "3 hours ago" },
  { id: "4", type: "vaccine", message: "💉 Bordetella vaccine is due soon for Buddy", read: true, createdAt: "1 day ago" },
  { id: "5", type: "appointment", message: "✅ Your booking for Luna's grooming is confirmed", read: true, createdAt: "2 days ago" },
  { id: "6", type: "service", message: "🛎 Paw Perfect Grooming booked for March 20", read: true, createdAt: "3 days ago" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <PageHeader title="Notifications 🔔" subtitle={`${unreadCount} unread`}>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-primary text-xs">
          <Check className="mr-1 h-3.5 w-3.5" /> Mark all read
        </Button>
      </PageHeader>

      <div className="mt-4 space-y-2">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              className={`cursor-pointer shadow-card transition-all ${!notif.read ? "border-primary/30 bg-primary-light/30" : ""}`}
              onClick={() => markRead(notif.id)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                {!notif.read && <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? "font-medium" : "text-muted-foreground"}`}>{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.createdAt}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
