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

export default function AddPetPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Pet added! 🎉", description: "Your new pet profile has been created." });
    navigate("/pets");
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-black">Add New Pet</h1>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          {/* Photo Upload */}
          <div className="mb-6 flex justify-center">
            <button className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-primary/30 bg-primary-light text-primary hover:bg-primary-light/80 transition-colors">
              <Camera className="h-6 w-6" />
              <span className="mt-1 text-[10px] font-medium">Add Photo</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Pet Name *</Label>
              <Input placeholder="e.g. Buddy" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Species *</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">🐕 Dog</SelectItem>
                    <SelectItem value="cat">🐈 Cat</SelectItem>
                    <SelectItem value="bird">🐦 Bird</SelectItem>
                    <SelectItem value="fish">🐟 Fish</SelectItem>
                    <SelectItem value="rabbit">🐇 Rabbit</SelectItem>
                    <SelectItem value="hamster">🐹 Hamster</SelectItem>
                    <SelectItem value="other">🐾 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Input placeholder="e.g. Labrador" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" placeholder="e.g. 12" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select>
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
              <Input placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <Label>Allergies</Label>
              <Input placeholder="e.g. Chicken, Dairy" />
            </div>

            <div className="space-y-2">
              <Label>Special Notes</Label>
              <Textarea placeholder="Any important info about your pet..." />
            </div>

            <Button type="submit" className="w-full rounded-full font-heading font-bold">
              Add Pet 🐾
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
