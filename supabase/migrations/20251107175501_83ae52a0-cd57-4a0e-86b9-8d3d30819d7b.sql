-- Add missing RLS policies for user_roles table to prevent privilege escalation
-- Only admins can insert new roles
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add explicit INSERT policy for profiles table for defense-in-depth
CREATE POLICY "Profiles can only be created for own user"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);