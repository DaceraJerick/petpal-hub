import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function AddPetPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [microchipId, setMicrochipId] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let photo_url: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("pet-photos").upload(path, photoFile);
      if (!uploadError) {
        const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
    }

    const { error } = await supabase.from("pets").insert({
      user_id: user.id,
      name,
      species: species || "Dog",
      breed: breed || null,
      dob: dob || null,
      weight: weight ? parseFloat(weight) : null,
      gender: (gender as "male" | "female" | "unknown") || "unknown",
      microchip_id: microchipId || null,
      allergies: allergies || null,
      notes: notes || null,
      photo_url,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["pets"] });
    toast({ title: "Pet added! 🎉", description: "Your new pet profile has been created." });
    navigate("/pets");
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pets")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-heading text-xl font-black">Add New Pet</h1>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="mb-6 flex justify-center">
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-primary/30 bg-primary-light text-primary hover:bg-primary-light/80 transition-colors">
              <Camera className="h-6 w-6" />
              <span className="mt-1 text-[10px] font-medium">{photoFile ? "Change" : "Add Photo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Pet Name *</Label>
              <Input placeholder="e.g. Buddy" required value={name} onChange={(e) => setName(e.target.value)} />
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
                    <SelectItem value="Rabbit">🐇 Rabbit</SelectItem>
                    <SelectItem value="Hamster">🐹 Hamster</SelectItem>
                    <SelectItem value="Other">🐾 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Input placeholder="e.g. Labrador" value={breed} onChange={(e) => setBreed(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" placeholder="e.g. 12" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">♂️ Male</SelectItem>
                    <SelectItem value="female">♀️ Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Microchip ID</Label>
              <Input placeholder="Optional" value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Input placeholder="e.g. Chicken, Dairy" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Special Notes</Label>
              <Textarea placeholder="Any important info about your pet..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="submit" className="w-full rounded-full font-heading font-bold" disabled={loading}>
              {loading ? "Adding..." : "Add Pet 🐾"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
