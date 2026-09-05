-- profiles extras
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consent_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_sms boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_community boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lead_stage text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- social handles
CREATE TABLE public.person_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, platform)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.person_handles TO authenticated;
GRANT ALL ON public.person_handles TO service_role;
ALTER TABLE public.person_handles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their own handles" ON public.person_handles
  FOR ALL TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- private notes
CREATE TABLE public.person_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX person_notes_profile_idx ON public.person_notes(profile_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.person_notes TO authenticated;
GRANT ALL ON public.person_notes TO service_role;
ALTER TABLE public.person_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notes" ON public.person_notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- availability
CREATE TABLE public.availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_minute smallint NOT NULL CHECK (start_minute BETWEEN 0 AND 1439),
  end_minute smallint NOT NULL CHECK (end_minute BETWEEN 1 AND 1440),
  slot_minutes smallint NOT NULL DEFAULT 30,
  buffer_minutes smallint NOT NULL DEFAULT 15,
  min_notice_hours smallint NOT NULL DEFAULT 12,
  timezone text NOT NULL DEFAULT 'America/New_York',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_rules TO authenticated;
GRANT SELECT ON public.availability_rules TO anon;
GRANT ALL ON public.availability_rules TO service_role;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read availability" ON public.availability_rules
  FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Admins manage availability" ON public.availability_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_availability_rules_updated_at
  BEFORE UPDATE ON public.availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.availability_rules (weekday, start_minute, end_minute, slot_minutes)
VALUES (1, 600, 1020, 30), (2, 600, 1020, 30), (3, 600, 1020, 30), (4, 600, 1020, 30);

-- bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_slug text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  reschedule_count smallint NOT NULL DEFAULT 0,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_user_idx ON public.bookings(user_id);
CREATE INDEX bookings_starts_idx ON public.bookings(starts_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their own bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  venue text,
  city text,
  description text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published events" ON public.events
  FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.events (slug, title, starts_at, ends_at, venue, city, description, published)
VALUES
  ('miami-beauty-weekend', 'Miami Beauty Weekend', '2026-09-26 14:00:00+00', '2026-09-27 22:00:00+00', 'Miami Beach Convention Center', 'Miami Beach, FL', 'Two days with beauty business owners. Take the Findability Score with us at the booth and leave with your first fix.', true),
  ('emerge-americas', 'eMerge Americas', '2026-10-18 13:00:00+00', '2026-10-19 21:00:00+00', 'Miami Beach Convention Center', 'Miami Beach, FL', 'Find us on the floor. We read your score with you and name the one thing costing you bookings.', true);

-- event attendees
CREATE TABLE public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  full_name text,
  business_name text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  consent_email boolean NOT NULL DEFAULT false,
  consent_sms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX event_attendees_event_idx ON public.event_attendees(event_id);
CREATE UNIQUE INDEX event_attendees_unique_person ON public.event_attendees(event_id, profile_id) WHERE profile_id IS NOT NULL;
GRANT SELECT, INSERT ON public.event_attendees TO authenticated;
GRANT ALL ON public.event_attendees TO service_role;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their own attendance" ON public.event_attendees
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members record their own attendance" ON public.event_attendees
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- email wording
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email wording" ON public.email_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.email_templates (slug, subject, body) VALUES
  ('booking_confirmed', 'Your session is booked', 'Hi {{first_name}}, your {{service}} is booked for {{when}}. Reply to this email if anything changes.'),
  ('booking_reminder_24h', 'Tomorrow: your session', 'Hi {{first_name}}, we meet tomorrow at {{when}} for your {{service}}. Bring the one thing you want fixed.'),
  ('booking_cancelled', 'Your session was cancelled', 'Hi {{first_name}}, your {{service}} on {{when}} is cancelled. Book another time whenever you are ready.'),
  ('score_result', 'Your Findability Score', 'Hi {{first_name}}, your score is {{total}} of 100. Your private results page is here: {{link}}');