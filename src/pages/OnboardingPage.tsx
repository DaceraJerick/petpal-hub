import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, User, Utensils, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { icon: User, title: "Your Profile", subtitle: "Tell us about yourself" },
  { icon: PawPrint, title: "Add Your Pet", subtitle: "Let's meet your furry friend" },
  { icon: Utensils, title: "First Schedule", subtitle: "Set up a feeding plan" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleFinish = () => {
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-8 bg-primary/40" : "w-8 bg-border"}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
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
                    <Input placeholder="How should we call you?" />
                  </div>
                  <div className="space-y-2">
                    <Label>How many pets do you have?</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 pet</SelectItem>
                        <SelectItem value="2">2 pets</SelectItem>
                        <SelectItem value="3">3 pets</SelectItem>
                        <SelectItem value="4+">4 or more</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pet Name</Label>
                    <Input placeholder="e.g. Buddy" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Species</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">🐕 Dog</SelectItem>
                          <SelectItem value="cat">🐈 Cat</SelectItem>
                          <SelectItem value="bird">🐦 Bird</SelectItem>
                          <SelectItem value="fish">🐟 Fish</SelectItem>
                          <SelectItem value="other">🐾 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Breed</Label>
                      <Input placeholder="e.g. Labrador" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input type="number" placeholder="e.g. 12" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meal Name</Label>
                    <Input placeholder="e.g. Breakfast" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Portion</Label>
                      <Input placeholder="e.g. 1 cup" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Food Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry">Dry Kibble</SelectItem>
                        <SelectItem value="wet">Wet Food</SelectItem>
                        <SelectItem value="raw">Raw Food</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (step < 2) setStep(step + 1);
                    else handleFinish();
                  }}
                  className="rounded-full"
                >
                  {step < 2 ? (
                    <>Next <ChevronRight className="ml-1 h-4 w-4" /></>
                  ) : (
                    "Finish Setup 🎉"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
