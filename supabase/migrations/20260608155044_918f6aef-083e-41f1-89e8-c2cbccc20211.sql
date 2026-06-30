-- Services: add connection/plumbing columns so the public site can read them
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS key TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS services_key_unique ON public.services (key) WHERE key IS NOT NULL;

-- Testimonials: brand-new CMS-managed content
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  role_en TEXT, role_zh TEXT, role_mn TEXT,
  quote TEXT NOT NULL,
  quote_en TEXT, quote_zh TEXT, quote_mn TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  avatar_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published testimonials are public"
  ON public.testimonials FOR SELECT
  USING (published = true OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();