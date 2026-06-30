
-- Extend legal_documents into unified publishing CMS
ALTER TABLE public.legal_documents
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'legal_document',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS trending BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS summary_en TEXT,
  ADD COLUMN IF NOT EXISTS summary_zh TEXT,
  ADD COLUMN IF NOT EXISTS summary_mn TEXT,
  ADD COLUMN IF NOT EXISTS content_en JSONB,
  ADD COLUMN IF NOT EXISTS content_zh JSONB,
  ADD COLUMN IF NOT EXISTS content_mn JSONB,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}'::text[];

-- Constrain values
DO $$ BEGIN
  ALTER TABLE public.legal_documents
    ADD CONSTRAINT legal_documents_type_check CHECK (type IN ('news','legal_document'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.legal_documents
    ADD CONSTRAINT legal_documents_status_check CHECK (status IN ('draft','published','unpublished'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Slug helper
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(input,'')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Backfill slugs
UPDATE public.legal_documents
SET slug = COALESCE(NULLIF(slug,''), public.slugify(title) || '-' || substring(id::text,1,8))
WHERE slug IS NULL OR slug = '';

-- Backfill status from published flag
UPDATE public.legal_documents
SET status = CASE WHEN published THEN 'published' ELSE 'draft' END,
    published_at = COALESCE(published_at, CASE WHEN published THEN created_at END);

ALTER TABLE public.legal_documents
  ALTER COLUMN slug SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.legal_documents
    ADD CONSTRAINT legal_documents_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON public.legal_documents(type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_status ON public.legal_documents(status);
CREATE INDEX IF NOT EXISTS idx_legal_documents_category ON public.legal_documents(category_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_slug ON public.legal_documents(slug);

-- Keep published bool in sync with status via trigger
CREATE OR REPLACE FUNCTION public.sync_legal_doc_published()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.published := (NEW.status = 'published');
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_legal_doc_published ON public.legal_documents;
CREATE TRIGGER trg_sync_legal_doc_published
  BEFORE INSERT OR UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.sync_legal_doc_published();

-- Backfill legacy publications -> legal_documents (as news)
INSERT INTO public.legal_documents (
  title, title_en, slug, type, status, published, published_at,
  file_path, is_free, price_cents, created_at, updated_at
)
SELECT
  p.title,
  p.title,
  public.slugify(p.title) || '-' || substring(p.id::text,1,8),
  'news',
  'published',
  true,
  p.date::timestamptz,
  NULL,
  true,
  0,
  p.created_at,
  p.updated_at
FROM public.publications p
WHERE NOT EXISTS (
  SELECT 1 FROM public.legal_documents d
  WHERE d.slug = public.slugify(p.title) || '-' || substring(p.id::text,1,8)
);
