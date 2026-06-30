
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_zh text,
  ADD COLUMN IF NOT EXISTS title_mn text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS description_mn text;

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_zh text,
  ADD COLUMN IF NOT EXISTS title_mn text;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_zh text,
  ADD COLUMN IF NOT EXISTS title_mn text,
  ADD COLUMN IF NOT EXISTS content_en text,
  ADD COLUMN IF NOT EXISTS content_zh text,
  ADD COLUMN IF NOT EXISTS content_mn text;
