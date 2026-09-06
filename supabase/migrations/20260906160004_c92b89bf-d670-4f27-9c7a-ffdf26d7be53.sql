CREATE TABLE public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  full_name text NOT NULL,
  business_name text,
  instagram text,
  other_links text,
  event_name text,
  interview_date text,
  consent_confirmed boolean NOT NULL DEFAULT false,
  approved_for_posting boolean NOT NULL DEFAULT false,
  video_approved boolean NOT NULL DEFAULT false,
  overall_status text,
  editing_status text,
  posting_status text,
  video_link text,
  final_video_link text,
  photo_link text,
  posted_links text,
  notes text,
  editing_notes text,
  caption text,
  email text,
  phone text,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO authenticated;
GRANT SELECT ON public.interviews TO anon;
GRANT ALL ON public.interviews TO service_role;

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team manages interviews" ON public.interviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Anyone can read posted interviews" ON public.interviews FOR SELECT TO anon, authenticated
  USING (consent_confirmed AND approved_for_posting AND overall_status = 'Posted');

CREATE INDEX interviews_status_idx ON public.interviews (overall_status);

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();