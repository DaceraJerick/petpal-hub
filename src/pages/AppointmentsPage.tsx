import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, MapPin, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const statusVariant = {
  pending: "warning" as const,
  confirmed: "default" as const,
  completed: "success" as const,
  cancelled: "destructive" as const,
};

const mockAppointments = [
  { id: "1", pet: "Buddy", clinic: "Happy Paws Clinic", vet: "Dr. Smith", date: "2026-03-15", time: "10:00 AM", reason: "Annual checkup", status: "confirmed" },
  { id: "2", pet: "Luna", clinic: "City Vet Center", vet: "Dr. Garcia", date: "2026-03-20", time: "2:30 PM", reason: "Vaccination", status: "pending" },
  { id: "3", pet: "Buddy", clinic: "Happy Paws Clinic", vet: "Dr. Smith", date: "2026-02-10", time: "11:00 AM", reason: "Dental cleaning", status: "completed" },
  { id: "4", pet: "Luna", clinic: "Animal Care Plus", vet: "Dr. Lee", date: "2026-01-05", time: "3:00 PM", reason: "Skin allergy", status: "cancelled" },
];

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const upcoming = mockAppointments.filter((a) => a.status === "confirmed" || a.status === "pending");
  const past = mockAppointments.filter((a) => a.status === "completed" || a.status === "cancelled");

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
          {upcoming.map((appt, i) => (
            <AppointmentCard key={appt.id} appt={appt} index={i} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {past.map((appt, i) => (
            <AppointmentCard key={appt.id} appt={appt} index={i} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentCard({ appt, index }: { appt: typeof mockAppointments[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading font-bold">{appt.pet}'s {appt.reason}</h3>
              <p className="text-sm text-muted-foreground">{appt.vet} — {appt.clinic}</p>
            </div>
            <PillBadge variant={statusVariant[appt.status as keyof typeof statusVariant]}>
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </PillBadge>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {appt.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {appt.time}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
