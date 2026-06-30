-- Add manual payment fields to legal_doc_purchases
ALTER TABLE public.legal_doc_purchases
  ADD COLUMN IF NOT EXISTS confirmation_code text,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_note text;

-- Tighten client insert: only allow creating their own pending request
DROP POLICY IF EXISTS "Users insert own pending purchase" ON public.legal_doc_purchases;
CREATE POLICY "Users insert own pending purchase"
  ON public.legal_doc_purchases
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Allow admins to authorize (update) and remove requests
DROP POLICY IF EXISTS "Admins manage purchases" ON public.legal_doc_purchases;
CREATE POLICY "Admins update purchases"
  ON public.legal_doc_purchases
  FOR UPDATE
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins delete purchases" ON public.legal_doc_purchases;
CREATE POLICY "Admins delete purchases"
  ON public.legal_doc_purchases
  FOR DELETE
  USING (public.is_admin_or_super(auth.uid()));