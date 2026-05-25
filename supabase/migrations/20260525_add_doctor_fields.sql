-- Add doctor-specific fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS clinic_address TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_specialization ON public.profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_profiles_contact_number ON public.profiles(contact_number);
