
CREATE TABLE public.chat_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  query text NOT NULL,
  response_length int NOT NULL DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'en',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics"
ON public.chat_analytics FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
ON public.chat_analytics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_chat_analytics_created ON public.chat_analytics(created_at DESC);
CREATE INDEX idx_chat_analytics_user ON public.chat_analytics(user_id);
