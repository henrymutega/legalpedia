
-- =========================
-- TEAM MEMBERS
-- =========================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  role_en TEXT, role_zh TEXT, role_mn TEXT,
  specialty TEXT,
  specialty_en TEXT, specialty_zh TEXT, specialty_mn TEXT,
  bio TEXT,
  bio_en TEXT, bio_zh TEXT, bio_mn TEXT,
  photo_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins insert team members" ON public.team_members FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update team members" ON public.team_members FOR UPDATE USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete team members" ON public.team_members FOR DELETE USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_team_members_updated_at BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- FAQS
-- =========================
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  question_en TEXT, question_zh TEXT, question_mn TEXT,
  answer TEXT NOT NULL,
  answer_en TEXT, answer_zh TEXT, answer_mn TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admins insert faqs" ON public.faqs FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update faqs" ON public.faqs FOR UPDATE USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete faqs" ON public.faqs FOR DELETE USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SITE PAGES
-- =========================
CREATE TABLE public.site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  title TEXT,
  title_en TEXT, title_zh TEXT, title_mn TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_en JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_zh JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_mn JSONB NOT NULL DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site pages" ON public.site_pages FOR SELECT USING (true);
CREATE POLICY "Admins insert site pages" ON public.site_pages FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update site pages" ON public.site_pages FOR UPDATE USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete site pages" ON public.site_pages FOR DELETE USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_site_pages_updated_at BEFORE UPDATE ON public.site_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SEO SETTINGS
-- =========================
CREATE TABLE public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  title TEXT,
  title_en TEXT, title_zh TEXT, title_mn TEXT,
  description TEXT,
  description_en TEXT, description_zh TEXT, description_mn TEXT,
  keywords TEXT,
  keywords_en TEXT, keywords_zh TEXT, keywords_mn TEXT,
  og_image TEXT,
  canonical_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seo" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admins insert seo" ON public.seo_settings FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update seo" ON public.seo_settings FOR UPDATE USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete seo" ON public.seo_settings FOR DELETE USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_seo_settings_updated_at BEFORE UPDATE ON public.seo_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- MEDIA ASSETS
-- =========================
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL DEFAULT 'media',
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Admins insert media" ON public.media_assets FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update media" ON public.media_assets FOR UPDATE USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete media" ON public.media_assets FOR DELETE USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_media_assets_updated_at BEFORE UPDATE ON public.media_assets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- MEDIA STORAGE BUCKET
-- =========================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update media objects" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_admin_or_super(auth.uid())) WITH CHECK (bucket_id = 'media' AND public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete media objects" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_admin_or_super(auth.uid()));
