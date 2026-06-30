
-- Categories
CREATE TABLE public.legal_doc_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  name_en text,
  name_zh text,
  name_mn text,
  icon text,
  display_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_doc_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.legal_doc_categories FOR SELECT USING (true);
CREATE POLICY "Admins insert categories" ON public.legal_doc_categories FOR INSERT WITH CHECK (is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update categories" ON public.legal_doc_categories FOR UPDATE USING (is_admin_or_super(auth.uid())) WITH CHECK (is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete categories" ON public.legal_doc_categories FOR DELETE USING (is_admin_or_super(auth.uid()));

CREATE TRIGGER set_legal_doc_categories_updated_at BEFORE UPDATE ON public.legal_doc_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Documents
CREATE TABLE public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.legal_doc_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  title_en text,
  title_zh text,
  title_mn text,
  description text,
  description_en text,
  description_zh text,
  description_mn text,
  preview text,
  preview_en text,
  preview_zh text,
  preview_mn text,
  languages text[] NOT NULL DEFAULT '{en}',
  file_path text,
  file_type text,
  file_size_bytes bigint,
  thumbnail_url text,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  is_free boolean NOT NULL DEFAULT false,
  download_count int NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published documents" ON public.legal_documents FOR SELECT
  USING (published = true OR is_admin_or_super(auth.uid()));
CREATE POLICY "Admins insert documents" ON public.legal_documents FOR INSERT
  WITH CHECK (is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update documents" ON public.legal_documents FOR UPDATE
  USING (is_admin_or_super(auth.uid())) WITH CHECK (is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete documents" ON public.legal_documents FOR DELETE
  USING (is_admin_or_super(auth.uid()));

CREATE TRIGGER set_legal_documents_updated_at BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_legal_documents_category ON public.legal_documents(category_id);
CREATE INDEX idx_legal_documents_published ON public.legal_documents(published);

-- Purchases
CREATE TABLE public.legal_doc_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  amount_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_doc_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own purchases" ON public.legal_doc_purchases FOR SELECT
  USING (user_id = auth.uid() OR is_admin_or_super(auth.uid()));
CREATE POLICY "Users insert own pending purchase" ON public.legal_doc_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_legal_doc_purchases_updated_at BEFORE UPDATE ON public.legal_doc_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_purchases_user ON public.legal_doc_purchases(user_id);
CREATE INDEX idx_purchases_doc ON public.legal_doc_purchases(document_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-documents', 'legal-documents', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-doc-thumbnails', 'legal-doc-thumbnails', true)
  ON CONFLICT (id) DO NOTHING;

-- Thumbnails: public read, admin write
CREATE POLICY "Thumbnails public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'legal-doc-thumbnails');
CREATE POLICY "Admins upload thumbnails" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'legal-doc-thumbnails' AND is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update thumbnails" ON storage.objects FOR UPDATE
  USING (bucket_id = 'legal-doc-thumbnails' AND is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete thumbnails" ON storage.objects FOR DELETE
  USING (bucket_id = 'legal-doc-thumbnails' AND is_admin_or_super(auth.uid()));

-- Legal documents private bucket: admin write only; reads go through edge function with service role
CREATE POLICY "Admins upload legal docs" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'legal-documents' AND is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update legal docs" ON storage.objects FOR UPDATE
  USING (bucket_id = 'legal-documents' AND is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete legal docs" ON storage.objects FOR DELETE
  USING (bucket_id = 'legal-documents' AND is_admin_or_super(auth.uid()));
CREATE POLICY "Admins read legal docs" ON storage.objects FOR SELECT
  USING (bucket_id = 'legal-documents' AND is_admin_or_super(auth.uid()));

-- Seed default categories
INSERT INTO public.legal_doc_categories (key, name, name_en, name_zh, name_mn, icon, display_order) VALUES
  ('corporate', 'Corporate Law', 'Corporate Law', '公司法', 'Компанийн эрх зүй', 'Building2', 1),
  ('business-agreements', 'Business Agreements', 'Business Agreements', '商业协议', 'Бизнесийн гэрээ', 'Handshake', 2),
  ('employment', 'Employment Law', 'Employment Law', '劳动法', 'Хөдөлмөрийн эрх зүй', 'Briefcase', 3),
  ('family', 'Family Law', 'Family Law', '家庭法', 'Гэр бүлийн эрх зүй', 'Heart', 4),
  ('real-estate', 'Real Estate Law', 'Real Estate Law', '房地产法', 'Үл хөдлөх хөрөнгө', 'Home', 5),
  ('ip', 'Intellectual Property', 'Intellectual Property', '知识产权', 'Оюуны өмч', 'Lightbulb', 6),
  ('civil-litigation', 'Civil Litigation', 'Civil Litigation', '民事诉讼', 'Иргэний нэхэмжлэл', 'Scale', 7),
  ('contracts', 'Contracts & Agreements', 'Contracts & Agreements', '合同与协议', 'Гэрээ хэлэлцээр', 'FileSignature', 8),
  ('compliance', 'Compliance Documents', 'Compliance Documents', '合规文件', 'Дагаж мөрдөх баримт', 'ShieldCheck', 9),
  ('immigration', 'Immigration Documents', 'Immigration Documents', '移民文件', 'Цагаачлалын баримт', 'Plane', 10),
  ('arbitration', 'Arbitration & Dispute Resolution', 'Arbitration & Dispute Resolution', '仲裁与争议解决', 'Арбитр ба маргаан шийдвэрлэх', 'Gavel', 11);
