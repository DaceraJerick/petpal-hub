import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, User, Utensils, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { icon: User, title: "Your Profile", subtitle: "Tell us about yourself" },
  { icon: PawPrint, title: "Add Your Pet", subtitle: "Let's meet your furry friend" },
  { icon: Utensils, title: "First Schedule", subtitle: "Set up a feeding plan" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [portion, setPortion] = useState("");
  const [foodType, setFoodType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    // Update profile name
    if (displayName) {
      await supabase.from("profiles").update({ name: displayName }).eq("user_id", user.id);
    }

    // Create pet
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .insert({ name: petName || "My Pet", species: species || "Dog", breed: breed || null, dob: dob || null, weight: weight ? parseFloat(weight) : null, user_id: user.id })
      .select()
      .single();

    if (petError) {
      toast({ title: "Error creating pet", description: petError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create feeding schedule
    if (mealName && mealTime && pet) {
      await supabase.from("feeding_schedules").insert({
        pet_id: pet.id,
        meal_name: mealName,
        time: mealTime,
        portion: portion || null,
        food_type: foodType || null,
      });
    }

    setLoading(false);
    toast({ title: "All set! 🎉", description: "Your pet care hub is ready." });
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-8 bg-primary/40" : "w-8 bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                  {(() => { const Icon = steps[step].icon; return <Icon className="h-6 w-6 text-primary" />; })()}
                </div>
                <h2 className="font-heading text-xl font-black">{steps[step].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input placeholder="How should we call you?" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pet Name *</Label>
                    <Input placeholder="e.g. Buddy" value={petName} onChange={(e) => setPetName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Species *</Label>
                      <Select value={species} onValueChange={setSpecies}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dog">🐕 Dog</SelectItem>
                          <SelectItem value="Cat">🐈 Cat</SelectItem>
                          <SelectItem value="Bird">🐦 Bird</SelectItem>
                          <SelectItem value="Fish">🐟 Fish</SelectItem>
                          <SelectItem value="Other">🐾 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Breed</Label>
                      <Input placeholder="e.g. Labrador" value={breed} onChange={(e) => setBreed(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input type="number" placeholder="e.g. 12" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meal Name</Label>
                    <Input placeholder="e.g. Breakfast" value={mealName} onChange={(e) => setMealName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" value={mealTime} onChange={(e) => setMealTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Portion</Label>
                      <Input placeholder="e.g. 1 cup" value={portion} onChange={(e) => setPortion(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Food Type</Label>
                    <Select value={foodType} onValueChange={setFoodType}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dry Kibble">Dry Kibble</SelectItem>
                        <SelectItem value="Wet Food">Wet Food</SelectItem>
                        <SelectItem value="Raw Food">Raw Food</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => { if (step < 2) setStep(step + 1); else handleFinish(); }} className="rounded-full" disabled={loading}>
                  {step < 2 ? (<>Next <ChevronRight className="ml-1 h-4 w-4" /></>) : (loading ? "Setting up..." : "Finish Setup 🎉")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
