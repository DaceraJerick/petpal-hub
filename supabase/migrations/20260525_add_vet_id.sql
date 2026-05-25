-- Add vet_id to appointments and grant vets permissions
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS vet_id UUID REFERENCES auth.users(id);

-- Allow vets to view appointments assigned to them (or owners can view their own)
CREATE POLICY "Vets can view assigned appointments" ON public.appointments FOR SELECT
  TO authenticated USING (auth.uid() = vet_id OR auth.uid() = user_id);

-- Allow vets to update status on appointments assigned to them
CREATE POLICY "Vets can update assigned appointments" ON public.appointments FOR UPDATE
  TO authenticated USING (auth.uid() = vet_id) WITH CHECK (auth.uid() = vet_id);

-- Index for faster vet lookups
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON public.appointments(vet_id);
