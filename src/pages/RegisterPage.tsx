import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PawPrint, Mail, Lock, User, Eye, EyeOff, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"owner" | "vet">("owner");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: selectedRole },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Check your email! 📧", description: "We sent a verification link to confirm your account." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl gradient-header">
            <PawPrint className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl font-black">Create Account</CardTitle>
          <CardDescription>Join Trio Eyy Pet Care Hub today</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selector */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              id="role-owner"
              onClick={() => setSelectedRole("owner")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                selectedRole === "owner"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <PawPrint className="h-7 w-7" />
              <div className="text-center">
                <p className="font-heading text-sm font-bold">Pet Owner</p>
                <p className="text-xs opacity-70">Manage your pets</p>
              </div>
            </button>
            <button
              type="button"
              id="role-doctor"
              onClick={() => setSelectedRole("vet")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                selectedRole === "vet"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Stethoscope className="h-7 w-7" />
              <div className="text-center">
                <p className="font-heading text-sm font-bold">Doctor / Vet</p>
                <p className="text-xs opacity-70">Manage patients</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder={selectedRole === "vet" ? "Dr. Santos" : "Your name"} value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full font-heading font-bold" disabled={loading}>
              {loading ? "Creating account..." : `Create ${selectedRole === "vet" ? "Doctor" : "Pet Owner"} Account`}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
