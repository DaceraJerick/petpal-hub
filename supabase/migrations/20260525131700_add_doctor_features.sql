-- DOCTOR FEATURES MIGRATION
-- Adds doctor_id to appointments and proper RLS so doctors can manage their appointments

-- 1. Add doctor_id column to appointments (nullable, references auth.users)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index on doctor_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

-- 3. Allow doctors (vet role) to SELECT appointments assigned to them
CREATE POLICY "Doctors can view assigned appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'vet') AND doctor_id = auth.uid());

-- 4. Allow doctors to UPDATE status on their assigned appointments (accept/decline)
CREATE POLICY "Doctors can update assigned appointment status"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'vet') AND doctor_id = auth.uid());

-- 5. Allow admins full access to appointments (select + update)
CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Allow doctors to view profiles of their patients (users who booked with them)
CREATE POLICY "Doctors can view patient profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'vet')
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.user_id = profiles.user_id
        AND a.doctor_id = auth.uid()
    )
  );

-- 7. Allow doctors to view pets that have appointments with them
CREATE POLICY "Doctors can view patient pets"
  ON public.pets FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'vet')
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.pet_id = pets.id
        AND a.doctor_id = auth.uid()
    )
  );

-- 8. Allow users to view doctor profiles (for booking dropdown)
CREATE POLICY "Users can view doctor profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = profiles.user_id
        AND ur.role = 'vet'
    )
  );

-- 9. Update the default role trigger to read from user metadata
-- Replace the existing assign_default_role function to support role from metadata
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Read role from metadata if provided, default to 'owner'
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
  -- Only allow valid roles; default to 'owner' for unknown values
  IF _role NOT IN ('owner', 'vet') THEN
    _role := 'owner';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role::public.app_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
