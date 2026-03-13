
-- LARANA PET CARE HUB - FULL DATABASE SCHEMA

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('owner', 'vet', 'admin');
CREATE TYPE public.pet_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.health_record_type AS ENUM ('checkup', 'surgery', 'lab', 'other');
CREATE TYPE public.service_category AS ENUM ('grooming', 'boarding', 'dog_walking', 'pharmacy', 'training');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 2. UTILITY FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign owner role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- 5. PETS TABLE
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  dob DATE,
  weight DECIMAL(5,2),
  gender pet_gender DEFAULT 'unknown',
  photo_url TEXT,
  microchip_id TEXT,
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pets" ON public.pets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pets" ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON public.pets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON public.pets FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. FEEDING SCHEDULES
CREATE TABLE public.feeding_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  time TIME NOT NULL,
  food_type TEXT,
  portion TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pet feeding schedules" ON public.feeding_schedules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = feeding_schedules.pet_id AND pets.user_id = auth.uid()));

-- 7. FEEDING LOGS
CREATE TABLE public.feeding_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.feeding_schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  given_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feeding_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own feeding logs" ON public.feeding_logs FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.feeding_schedules fs
    JOIN public.pets p ON p.id = fs.pet_id
    WHERE fs.id = feeding_logs.schedule_id AND p.user_id = auth.uid()
  ));

-- 8. VET CLINICS
CREATE TABLE public.vet_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  operating_hours TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vet_clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view vet clinics" ON public.vet_clinics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage vet clinics" ON public.vet_clinics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. APPOINTMENTS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.vet_clinics(id),
  vet_name TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT,
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON public.appointments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. VACCINES
CREATE TABLE public.vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  date_given DATE,
  next_due DATE,
  administered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pet vaccines" ON public.vaccines FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = vaccines.pet_id AND pets.user_id = auth.uid()));

-- 11. MEDICATIONS
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  med_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pet medications" ON public.medications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = medications.pet_id AND pets.user_id = auth.uid()));

-- 12. HEALTH RECORDS
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  record_type health_record_type DEFAULT 'other',
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  record_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pet health records" ON public.health_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid()));

-- 13. SERVICES
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id),
  category service_category NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  location TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. SERVICE BOOKINGS
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own service bookings" ON public.service_bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own service bookings" ON public.service_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own service bookings" ON public.service_bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 15. SERVICE REVIEWS
CREATE TABLE public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.service_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own reviews" ON public.service_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 16. NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 17. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('health-documents', 'health-documents', false);

CREATE POLICY "Pet photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Users can upload pet photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own pet photos" ON storage.objects FOR UPDATE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own pet photos" ON storage.objects FOR DELETE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own health documents" ON storage.objects FOR SELECT USING (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload health documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own health documents" ON storage.objects FOR DELETE USING (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 18. INDEXES
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_feeding_schedules_pet_id ON public.feeding_schedules(pet_id);
CREATE INDEX idx_feeding_logs_schedule_id ON public.feeding_logs(schedule_id);
CREATE INDEX idx_feeding_logs_date ON public.feeding_logs(date);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_vaccines_pet_id ON public.vaccines(pet_id);
CREATE INDEX idx_medications_pet_id ON public.medications(pet_id);
CREATE INDEX idx_health_records_pet_id ON public.health_records(pet_id);
CREATE INDEX idx_service_bookings_user_id ON public.service_bookings(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
