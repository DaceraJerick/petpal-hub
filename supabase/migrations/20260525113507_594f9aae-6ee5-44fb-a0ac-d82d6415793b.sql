
-- 1. Extend app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'doctor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- 2. Extend appointment_status enum
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'rejected';

-- 3. Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT,
  clinic_address TEXT,
  contact_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view doctors"
  ON public.doctors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Doctors can insert own profile"
  ON public.doctors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile"
  ON public.doctors FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage doctors"
  ON public.doctors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Profiles: add contact_number
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- 5. Appointments: add doctor_id
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

-- 6. Doctor-side RLS for appointments
CREATE POLICY "Doctors can view their appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
  );

CREATE POLICY "Doctors can update their appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
  );

-- 7. Doctors can view pets belonging to clients who booked with them
CREATE POLICY "Doctors can view pets via appointments"
  ON public.pets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE a.pet_id = pets.id AND d.user_id = auth.uid()
    )
  );

-- 8. Update handle_new_user / assign_default_role to honor metadata role and create doctor row
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  meta_role TEXT;
  assigned_role public.app_role;
BEGIN
  meta_role := NEW.raw_user_meta_data->>'role';
  IF meta_role = 'doctor' THEN
    assigned_role := 'doctor';
  ELSE
    assigned_role := 'client';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);

  IF assigned_role = 'doctor' THEN
    INSERT INTO public.doctors (user_id, full_name, email, specialization, clinic_address, contact_number, photo_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      NEW.raw_user_meta_data->>'specialization',
      NEW.raw_user_meta_data->>'clinic_address',
      NEW.raw_user_meta_data->>'contact_number',
      NEW.raw_user_meta_data->>'photo_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, contact_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'contact_number'
  );
  RETURN NEW;
END;
$$;

-- 9. Ensure triggers exist on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- 10. Realtime for appointments
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 11. Storage bucket for doctor photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-photos', 'doctor-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Doctor photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-photos');

CREATE POLICY "Doctors can upload own photo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'doctor-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctors can update own photo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'doctor-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
