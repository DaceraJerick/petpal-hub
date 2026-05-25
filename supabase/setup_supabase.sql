-- LARANA PET CARE HUB - SETUP SCRIPT FOR CANTILAN, SURIGAO DEL SUR
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Enums (if they don't exist)
DO $$ BEGIN
    CREATE TYPE public.service_category AS ENUM ('grooming', 'boarding', 'dog_walking', 'pharmacy', 'training');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.service_category NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  location TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy for public viewing
-- This allows any authenticated user to see the list of services
DO $$ BEGIN
    CREATE POLICY "Anyone can view services" ON public.services FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Insert Sample Data for Cantilan, Surigao del Sur (UPDATED LAND COORDINATES)
-- We'll delete existing data first to avoid duplicates if you run this multiple times
TRUNCATE public.services CASCADE;

INSERT INTO public.services (name, category, description, price, location, rating, review_count, latitude, longitude)
VALUES 
('Cantilan Pet Grooming', 'grooming', 'Best pet grooming in Poblacion of Cantilan town proper.', '₱400 - ₱1,000', 'Poblacion, Cantilan', 4.9, 42, 9.3361, 125.9773),
('Surigao Pet Boarding', 'boarding', 'Safe and clean boarding for your pets near Magasang beach.', '₱600/night', 'Magasang, Cantilan', 4.8, 28, 9.3420, 125.9561),
('Cantilan Paws Walker', 'dog_walking', 'Reliable dog walking services by locals who love pets.', '₱200/hour', 'Parang, Cantilan', 4.7, 15, 9.2816, 125.9422),
('Cantilan Vet Pharmacy', 'pharmacy', 'Essential pet meds, vitamins, and specialized diets.', 'Varies', 'Poblacion, Cantilan', 4.6, 55, 9.3357, 125.9770),
('K9 Training Cantilan', 'training', 'Basic obedience and behavior training for all breeds.', '₱1,500/session', 'San Pedro, Cantilan', 4.9, 12, 9.3499, 125.9744);

-- 6. Ensure admin role exists for the admin user
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE u.email = 'admin@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'admin'
  );
