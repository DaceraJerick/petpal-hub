ALTER TABLE public.services ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION, ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

UPDATE public.services SET latitude = 14.5547, longitude = 121.0244 WHERE name ILIKE '%BGC%' OR name ILIKE '%taguig%';
UPDATE public.services SET latitude = 14.5995, longitude = 120.9842 WHERE name ILIKE '%manila%' OR name ILIKE '%ermita%';
UPDATE public.services SET latitude = 14.5764, longitude = 121.0851 WHERE name ILIKE '%pasig%';
UPDATE public.services SET latitude = 14.5547, longitude = 121.0509 WHERE name ILIKE '%makati%';
UPDATE public.services SET latitude = 14.6507, longitude = 121.0486 WHERE name ILIKE '%quezon%' OR name ILIKE '%QC%';
UPDATE public.services SET latitude = 14.5832, longitude = 120.9799 WHERE latitude IS NULL;