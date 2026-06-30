ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS full_en text,
  ADD COLUMN IF NOT EXISTS full_zh text,
  ADD COLUMN IF NOT EXISTS full_mn text,
  ADD COLUMN IF NOT EXISTS benefits_en text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS benefits_zh text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS benefits_mn text[] NOT NULL DEFAULT '{}';