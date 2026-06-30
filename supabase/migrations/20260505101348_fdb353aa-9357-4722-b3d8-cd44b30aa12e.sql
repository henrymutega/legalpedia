
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','lawyer')
  )
$$;

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'corporate',
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own cases" ON public.cases FOR SELECT
  USING (auth.uid() = client_id OR public.is_staff(auth.uid()));
CREATE POLICY "Clients create own cases" ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients/staff update cases" ON public.cases FOR UPDATE
  USING (auth.uid() = client_id OR public.is_staff(auth.uid()));
CREATE POLICY "Admins delete cases" ON public.cases FOR DELETE
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cases_client ON public.cases(client_id);
CREATE INDEX idx_cases_status ON public.cases(status);

CREATE TABLE public.case_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  kind text NOT NULL DEFAULT 'original',
  filename text NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View files of accessible cases" ON public.case_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id
    AND (c.client_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Insert files on accessible cases" ON public.case_files FOR INSERT
  WITH CHECK (uploaded_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.cases c WHERE c.id = case_id
      AND (c.client_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Admins delete files" ON public.case_files FOR DELETE
  USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_case_files_case ON public.case_files(case_id);

CREATE TABLE public.case_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View comments of accessible cases" ON public.case_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id
    AND (c.client_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Insert comments on accessible cases" ON public.case_comments FOR INSERT
  WITH CHECK (author_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.cases c WHERE c.id = case_id
      AND (c.client_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Admins delete comments" ON public.case_comments FOR DELETE
  USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_case_comments_case ON public.case_comments(case_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('case-files','case-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Case files read" ON storage.objects FOR SELECT
  USING (bucket_id = 'case-files' AND EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.client_id = auth.uid() OR public.is_staff(auth.uid()))));

CREATE POLICY "Case files upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'case-files' AND EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (
        (c.client_id = auth.uid() AND (storage.foldername(name))[2] = 'original')
        OR public.is_staff(auth.uid())
      )));

CREATE POLICY "Case files admin delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'case-files' AND public.has_role(auth.uid(),'admin'));
