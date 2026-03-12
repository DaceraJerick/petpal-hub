import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { PillBadge } from "@/components/ui/pill-badge";
import { motion } from "framer-motion";

const mockSchedules = [
  { id: "1", mealName: "Breakfast", time: "08:00", foodType: "Dry Kibble", portion: "1 cup", given: true },
  { id: "2", mealName: "Lunch", time: "12:30", foodType: "Wet Food", portion: "½ can", given: false },
  { id: "3", mealName: "Dinner", time: "18:00", foodType: "Mixed", portion: "1 cup + ½ can", given: false },
];

const nutritionTips = [
  "🥕 Labradors benefit from omega-3 fatty acids for healthy joints",
  "💧 Always ensure fresh water is available throughout the day",
  "🍖 Avoid feeding grapes, chocolate, and onions to dogs",
];

export default function FeedingManagerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState(mockSchedules);

  const completedCount = schedules.filter((s) => s.given).length;
  const progress = (completedCount / schedules.length) * 100;

  const toggleMeal = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, given: !s.given } : s))
    );
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/pets/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-black flex-1">Feeding Plan</h1>
        <Button size="sm" className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add Meal</Button>
      </div>

      {/* Progress */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="font-heading text-lg font-black text-primary">{completedCount}/{schedules.length}</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="mt-1 text-xs text-muted-foreground">
            {completedCount === schedules.length ? "🎉 All meals completed!" : `${schedules.length - completedCount} meals remaining`}
          </p>
        </CardContent>
      </Card>

      {/* Meal List */}
      <div className="space-y-3">
        {schedules.map((schedule, i) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`shadow-card transition-all ${schedule.given ? "opacity-70" : ""}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleMeal(schedule.id)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    schedule.given
                      ? "border-success bg-success text-success-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {schedule.given ? <Check className="h-5 w-5" /> : null}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-heading font-bold ${schedule.given ? "line-through" : ""}`}>
                      {schedule.mealName}
                    </h3>
                    <PillBadge variant="muted">{schedule.time}</PillBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{schedule.foodType} — {schedule.portion}</p>
                </div>
                {schedule.given && <PillBadge variant="success">Fed ✅</PillBadge>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Nutrition Tips */}
      <section className="mt-8">
        <h2 className="font-heading text-base font-bold mb-3">💡 Nutrition Tips</h2>
        <div className="space-y-2">
          {nutritionTips.map((tip, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-3">
                <p className="text-sm">{tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
