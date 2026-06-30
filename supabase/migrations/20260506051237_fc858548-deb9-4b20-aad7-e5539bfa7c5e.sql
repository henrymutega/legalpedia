
-- Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role='super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('admin','super_admin'))
$$;

-- Update is_staff to include super_admin
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('admin','lawyer','super_admin'))
$$;

-- Cases: add assignment columns
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS assigned_lawyer_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_cases_assigned_lawyer ON public.cases(assigned_lawyer_id);

-- Refine cases SELECT policy: lawyers only see assigned + their own as client; admins see all
DROP POLICY IF EXISTS "Clients view own cases" ON public.cases;
CREATE POLICY "View cases by role" ON public.cases FOR SELECT
USING (
  auth.uid() = client_id
  OR auth.uid() = assigned_lawyer_id
  OR public.is_admin_or_super(auth.uid())
);

-- Update policy: client (own), assigned lawyer, admin/super
DROP POLICY IF EXISTS "Clients/staff update cases" ON public.cases;
CREATE POLICY "Update cases by role" ON public.cases FOR UPDATE
USING (
  auth.uid() = client_id
  OR auth.uid() = assigned_lawyer_id
  OR public.is_admin_or_super(auth.uid())
);

-- Delete: admin or super
DROP POLICY IF EXISTS "Admins delete cases" ON public.cases;
CREATE POLICY "Admins delete cases" ON public.cases FOR DELETE
USING (public.is_admin_or_super(auth.uid()));

-- user_roles: allow super_admin to manage; admins keep manage too. Allow staff to view all roles for assignment UI.
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins or super manage roles" ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Staff can view all roles" ON public.user_roles;
CREATE POLICY "Staff can view all roles" ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- -- Assign super_admin role
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('73b5ca7d-3533-4d6f-a954-f46bdb447490','super_admin')
-- ON CONFLICT (user_id, role) DO NOTHING;