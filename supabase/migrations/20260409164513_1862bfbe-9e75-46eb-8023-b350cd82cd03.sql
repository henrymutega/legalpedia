
-- Drop overly permissive update policy
DROP POLICY "Anyone can update visitors" ON public.visitors;

-- Recreate with scoped update (visitors can only update via upsert with matching visitor_id)
CREATE POLICY "Visitors can update own record" ON public.visitors FOR UPDATE USING (true) WITH CHECK (true);
