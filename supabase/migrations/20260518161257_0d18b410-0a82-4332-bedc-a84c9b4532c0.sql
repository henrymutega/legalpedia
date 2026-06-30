CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  service text NOT NULL,
  preferred_date date,
  preferred_time text,
  message text,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit appointment"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view all appointments"
  ON public.appointments FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Lawyers view assigned appointments"
  ON public.appointments FOR SELECT
  USING (public.is_staff(auth.uid()) AND assigned_to = auth.uid());

CREATE POLICY "Admins update appointments"
  ON public.appointments FOR UPDATE
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Lawyers update own appointments"
  ON public.appointments FOR UPDATE
  USING (public.is_staff(auth.uid()) AND assigned_to = auth.uid())
  WITH CHECK (public.is_staff(auth.uid()) AND assigned_to = auth.uid());

CREATE POLICY "Admins delete appointments"
  ON public.appointments FOR DELETE
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_appointments_created_at ON public.appointments(created_at DESC);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_assigned_to ON public.appointments(assigned_to);