-- Allow users to insert their own roles (useful for signup flows)
-- WARNING: this permits users to add a role for themselves; for production consider admin approval flow

CREATE POLICY IF NOT EXISTS "Users can insert own roles" ON public.user_roles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Optionally allow users to view their roles (already exists) and update/delete should remain admin-only
