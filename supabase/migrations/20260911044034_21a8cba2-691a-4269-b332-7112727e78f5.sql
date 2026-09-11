ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS lead_stage text NOT NULL DEFAULT 'new';

ALTER TABLE public.people
  ADD CONSTRAINT people_lead_stage_valid
  CHECK (lead_stage IN ('new', 'contacted', 'call_booked', 'proposal', 'client', 'past'));

CREATE INDEX IF NOT EXISTS people_lead_stage_idx
  ON public.people (lead_stage);