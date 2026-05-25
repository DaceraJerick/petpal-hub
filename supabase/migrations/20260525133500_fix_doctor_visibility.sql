-- Fix visibility of doctors for pet owners

-- Allow any authenticated user to see who the doctors (vets) are.
-- Without this, users cannot see the list of doctors when booking because they can only see their own roles.
CREATE POLICY "Anyone can view vet roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (role = 'vet');
