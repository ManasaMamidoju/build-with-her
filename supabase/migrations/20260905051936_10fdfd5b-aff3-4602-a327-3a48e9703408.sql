CREATE TABLE public.score_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  website TEXT,
  phone TEXT,
  primary_source TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  area_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_score INTEGER NOT NULL,
  band TEXT NOT NULL,
  top_fixes JSONB NOT NULL DEFAULT '[]'::jsonb,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_score_submissions_email ON public.score_submissions (lower(email));
CREATE INDEX idx_score_submissions_claimed_by ON public.score_submissions (claimed_by);

GRANT SELECT ON public.score_submissions TO authenticated;
GRANT ALL ON public.score_submissions TO service_role;

ALTER TABLE public.score_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read their own submissions"
ON public.score_submissions
FOR SELECT
TO authenticated
USING (
  claimed_by = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  OR public.has_role(auth.uid(), 'admin')
);

CREATE TRIGGER update_score_submissions_updated_at
BEFORE UPDATE ON public.score_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();