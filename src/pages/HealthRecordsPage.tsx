import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PillBadge } from "@/components/ui/pill-badge";
import { LoadingCard } from "@/components/ui/loading-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const typeColors = { checkup: "default" as const, surgery: "accent" as const, lab: "warning" as const, other: "muted" as const };

export default function HealthRecordsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [recordType, setRecordType] = useState("checkup");
  const [file, setFile] = useState<File | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["health-records", id],
    queryFn: async () => {
      const { data } = await supabase.from("health_records").select("*").eq("pet_id", id!).order("record_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const addRecord = useMutation({
    mutationFn: async () => {
      let file_url: string | null = null;
      if (file && user) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("health-documents").upload(path, file);
        if (!upErr) {
          // Private bucket - use signed URL or just store the path
          file_url = path;
        }
      }
      const { error } = await supabase.from("health_records").insert({
        pet_id: id!,
        title,
        description: desc || null,
        record_date: recordDate || null,
        record_type: recordType as "checkup" | "surgery" | "lab" | "other",
        file_url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records", id] });
      setAddOpen(false);
      setTitle(""); setDesc(""); setRecordDate(""); setFile(null);
      toast({ title: "Record added ✅" });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  if (isLoading) return <div className="container mx-auto max-w-3xl px-4 py-4"><LoadingCard /><LoadingCard /></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/pets/${id}`)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-heading text-xl font-black flex-1">Health Records</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button size="sm" className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Health Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Annual Checkup" /></div>
              <div><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Notes..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={recordDate} onChange={e => setRecordDate(e.target.value)} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={recordType} onValueChange={setRecordType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Checkup</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="lab">Lab Results</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Attach File</Label>
                <Input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={() => addRecord.mutate()} disabled={!title} className="w-full rounded-full">Add Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card mb-6 border-dashed border-2 border-primary/30" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="h-8 w-8 text-primary mb-2" />
          <p className="text-sm font-medium">Upload Health Documents</p>
          <p className="text-xs text-muted-foreground">PDF, images — drag & drop or click to browse</p>
          <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => fileRef.current?.click()}>Browse Files</Button>
          <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setAddOpen(true); } }} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {records.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No health records yet.</p>}
        {records.map((record) => (
          <Card key={record.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm">{record.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{record.description || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{record.record_date || "—"}</p>
                  </div>
                </div>
                <PillBadge variant={typeColors[(record.record_type as keyof typeof typeColors) || "other"]}>
                  {record.record_type || "other"}
                </PillBadge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
