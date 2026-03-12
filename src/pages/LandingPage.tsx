import { PawPrint, Heart, Calendar, Utensils, Stethoscope, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: PawPrint, title: "Pet Profiles", desc: "Track all your pets' info in one place" },
  { icon: Utensils, title: "Feeding Plans", desc: "Never miss a meal with smart schedules" },
  { icon: Calendar, title: "Vet Appointments", desc: "Book & manage vet visits easily" },
  { icon: Heart, title: "Health Records", desc: "Vaccines, meds & documents organized" },
  { icon: ShoppingBag, title: "Pet Services", desc: "Grooming, boarding & more" },
  { icon: Stethoscope, title: "Health Score", desc: "Monitor your pet's wellness" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-header px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-primary-foreground">
              <PawPrint className="h-4 w-4" /> Your pet's care, simplified
            </div>
            <h1 className="font-heading text-4xl font-black text-primary-foreground md:text-6xl">
              Larana Pet Care Hub
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80">
              The all-in-one platform to manage feeding schedules, vet appointments, health records, and more for your beloved pets.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-8 font-heading font-bold shadow-elevated"
              >
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10 px-8"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-8 bg-background" style={{ borderRadius: "100% 100% 0 0" }} />
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
        <h2 className="text-center font-heading text-2xl font-extrabold md:text-3xl">
          Everything your pet needs 🐾
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
          From daily feeding to health tracking — Larana keeps your pet's care organized.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-lg border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-base font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-header px-4 py-16 text-center md:py-20">
        <h2 className="font-heading text-2xl font-black text-primary-foreground md:text-3xl">
          Ready to give your pet the best care?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-primary-foreground/80">
          Join thousands of pet owners who trust Larana for their pet's daily care.
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/register")}
          className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-8 font-heading font-bold"
        >
          Create Free Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Larana Pet Care Hub. Built with ❤️ by Ecel, Joyce & Melgerose.</p>
      </footer>
    </div>
  );
}
