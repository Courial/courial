
-- Create site_visits table for organic analytics tracking
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  country TEXT,
  city TEXT,
  ip_address TEXT,
  duration_seconds INTEGER,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Only admins can read visits
CREATE POLICY "Admins can read site visits"
ON public.site_visits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow edge function inserts via service role (no INSERT policy needed for anon)
-- We'll use service role in the edge function

-- Index for date range queries
CREATE INDEX idx_site_visits_entered_at ON public.site_visits (entered_at DESC);
