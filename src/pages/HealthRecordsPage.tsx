import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PillBadge } from "@/components/ui/pill-badge";

const mockRecords = [
  { id: "1", type: "checkup", title: "Annual Checkup", date: "2026-02-10", description: "All vitals normal. Weight stable.", vet: "Dr. Smith" },
  { id: "2", type: "surgery", title: "Dental Cleaning", date: "2025-11-05", description: "Minor tartar removal. No complications.", vet: "Dr. Garcia" },
  { id: "3", type: "lab", title: "Blood Work Results", date: "2025-09-15", description: "All values within normal range.", vet: "Dr. Smith" },
];

const typeColors = {
  checkup: "default" as const,
  surgery: "accent" as const,
  lab: "warning" as const,
  other: "muted" as const,
};

export default function HealthRecordsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/pets/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-black flex-1">Health Records</h1>
        <Button size="sm" className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </div>

      {/* Upload */}
      <Card className="shadow-card mb-6 border-dashed border-2 border-primary/30">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="h-8 w-8 text-primary mb-2" />
          <p className="text-sm font-medium">Upload Health Documents</p>
          <p className="text-xs text-muted-foreground">PDF, images — drag & drop or click to browse</p>
          <Button variant="outline" size="sm" className="mt-3 rounded-full">Browse Files</Button>
        </CardContent>
      </Card>

      {/* Records */}
      <div className="space-y-3">
        {mockRecords.map((record) => (
          <Card key={record.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm">{record.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{record.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{record.vet} — {record.date}</p>
                  </div>
                </div>
                <PillBadge variant={typeColors[record.type as keyof typeof typeColors]}>
                  {record.type}
                </PillBadge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
