-- Allow lawyers (staff) to atomically self-claim unassigned cases.
-- Existing UPDATE policy stays; we add an additional permissive policy for the unassigned->claim transition.
DROP POLICY IF EXISTS "Staff can claim unassigned cases" ON public.cases;
CREATE POLICY "Staff can claim unassigned cases"
ON public.cases
FOR UPDATE
USING (assigned_lawyer_id IS NULL AND public.is_staff(auth.uid()))
WITH CHECK (assigned_lawyer_id = auth.uid() AND public.is_staff(auth.uid()));

-- Make sure realtime gets full row payloads for cases / case_files / case_comments
ALTER TABLE public.cases REPLICA IDENTITY FULL;
ALTER TABLE public.case_files REPLICA IDENTITY FULL;
ALTER TABLE public.case_comments REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.cases; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.case_files; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.case_comments; EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;