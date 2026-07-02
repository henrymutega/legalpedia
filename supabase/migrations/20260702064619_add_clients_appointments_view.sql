CREATE POLICY "Clients view own appointments by email"
ON public.appointments
FOR SELECT
TO authenticated
USING (lower(email) = lower((auth.jwt() ->> 'email')));