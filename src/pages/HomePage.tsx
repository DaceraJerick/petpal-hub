import { PawPrint, Utensils, Stethoscope, Scissors, Bell, ChevronRight, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PillBadge } from "@/components/ui/pill-badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const quickActions = [
  { icon: Utensils, label: "Feed", color: "text-primary", bg: "bg-primary-light", path: "/pets" },
  { icon: Stethoscope, label: "Vet", color: "text-accent", bg: "bg-accent/10", path: "/appointments/new" },
  { icon: Heart, label: "Medicine", color: "text-destructive", bg: "bg-destructive/10", path: "/pets" },
  { icon: Scissors, label: "Grooming", color: "text-warning-foreground", bg: "bg-warning/20", path: "/services" },
];

const todaySchedule = [
  { time: "8:00 AM", task: "Breakfast — Buddy", type: "feeding", done: true },
  { time: "10:00 AM", task: "Medication — Luna", type: "medication", done: false },
  { time: "2:00 PM", task: "Vet Checkup — Buddy", type: "appointment", done: false },
  { time: "6:00 PM", task: "Dinner — Buddy", type: "feeding", done: false },
];

const mockPets = [
  { name: "Buddy", species: "Dog", breed: "Labrador", healthScore: 85, emoji: "🐕" },
  { name: "Luna", species: "Cat", breed: "Persian", healthScore: 72, emoji: "🐈" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
      <PageHeader
        title="Good morning! 🌞"
        subtitle="Here's what's happening with your pets today"
        gradient
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/notifications")}
          className="relative text-primary-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">3</span>
        </Button>
      </PageHeader>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 shadow-card transition-shadow hover:shadow-elevated"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action.bg}`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Pets Carousel */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-extrabold">My Pets</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/pets")} className="text-primary text-xs">
            View All <ChevronRight className="ml-0.5 h-3 w-3" />
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
          {mockPets.map((pet) => (
            <Card
              key={pet.name}
              className="min-w-[200px] snap-start cursor-pointer shadow-card transition-shadow hover:shadow-elevated"
              onClick={() => navigate("/pets/1")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-2xl">
                    {pet.emoji}
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold">{pet.name}</h3>
                    <p className="text-xs text-muted-foreground">{pet.breed}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Health Score</span>
                    <span className="font-heading font-bold text-primary">{pet.healthScore}%</span>
                  </div>
                  <Progress value={pet.healthScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-extrabold mb-3">Today's Schedule</h2>
        <div className="space-y-2">
          {todaySchedule.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card"
            >
              <span className="min-w-[60px] text-xs font-medium text-muted-foreground">{item.time}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : ""}`}>
                  {item.task}
                </p>
              </div>
              <PillBadge variant={item.done ? "success" : item.type === "appointment" ? "accent" : "default"}>
                {item.done ? "Done" : item.type === "appointment" ? "Upcoming" : "Pending"}
              </PillBadge>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Reminders */}
      <section className="mt-8 mb-8">
        <h2 className="font-heading text-lg font-extrabold mb-3">Upcoming (Next 7 Days)</h2>
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Buddy's Vaccination</p>
                <p className="text-xs text-muted-foreground">March 15 — Rabies booster</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Scissors className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Luna's Grooming</p>
                <p className="text-xs text-muted-foreground">March 17 — Full grooming session</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
