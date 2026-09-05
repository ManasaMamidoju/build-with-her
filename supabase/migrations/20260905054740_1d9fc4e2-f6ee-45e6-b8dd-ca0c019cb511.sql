ALTER TABLE public.score_submissions
  ADD COLUMN IF NOT EXISTS handles jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS consent_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_sms boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_community boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_terms_at timestamptz;