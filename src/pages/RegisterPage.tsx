import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PawPrint, Mail, Lock, User, Eye, EyeOff, Phone, Stethoscope, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Role = "client" | "doctor";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const metadata: Record<string, string> = {
      full_name: name,
      role,
      contact_number: contactNumber,
    };
    if (role === "doctor") {
      metadata.specialization = specialization;
      metadata.clinic_address = clinicAddress;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: window.location.origin },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }

    // Upload doctor photo after signup if session is available
    if (role === "doctor" && photoFile && signUpData.user) {
      const userId = signUpData.user.id;
      const ext = photoFile.name.split(".").pop();
      const path = `${userId}/profile.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("doctor-photos")
        .upload(path, photoFile, { upsert: true });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("doctor-photos").getPublicUrl(path);
        await supabase.from("doctors").update({ photo_url: pub.publicUrl }).eq("user_id", userId);
      }
    }

    setLoading(false);
    toast({
      title: "Check your email! 📧",
      description: "We sent a verification link to confirm your account.",
    });
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl gradient-header">
            <PawPrint className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl font-black">Create Account</CardTitle>
          <CardDescription>Join the Pet Care Hub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`rounded-full py-2 text-sm font-bold transition ${
                role === "client" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              }`}
            >
              🐾 Client with Pet
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`rounded-full py-2 text-sm font-bold transition ${
                role === "doctor" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              }`}
            >
              🩺 Doctor
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="contact" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="pl-10" required />
              </div>
            </div>

            {role === "doctor" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="spec">Specialization</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="spec" placeholder="e.g. Small animal surgery" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clinic">Clinic Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="clinic" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="photo">Profile Photo</Label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="pl-10" />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full rounded-full font-heading font-bold" disabled={loading}>
              {loading ? "Creating account..." : `Create ${role === "doctor" ? "Doctor" : "Client"} Account`}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
