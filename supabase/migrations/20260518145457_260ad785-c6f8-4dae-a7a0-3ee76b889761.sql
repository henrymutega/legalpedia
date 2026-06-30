DROP POLICY IF EXISTS "View cases by role" ON public.cases;
CREATE POLICY "View cases by role" ON public.cases FOR SELECT
USING (
  auth.uid() = client_id
  OR public.is_staff(auth.uid())
);

DROP POLICY IF EXISTS "Update cases by role" ON public.cases;
CREATE POLICY "Update cases by role" ON public.cases FOR UPDATE
USING (
  auth.uid() = client_id
  OR public.is_staff(auth.uid())
)
WITH CHECK (
  auth.uid() = client_id
  OR public.is_staff(auth.uid())
);