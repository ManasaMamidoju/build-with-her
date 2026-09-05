CREATE TABLE public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.industries TO anon;
GRANT SELECT ON public.industries TO authenticated;
GRANT ALL ON public.industries TO service_role;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read industries" ON public.industries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage industries" ON public.industries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.industries (slug, name, sort_order) VALUES
  ('coach-consultant', 'Coach or consultant', 1),
  ('creative-services', 'Creative services (design, copy, photo, video)', 2),
  ('health-wellness', 'Health and wellness', 3),
  ('beauty-style', 'Beauty and style', 4),
  ('events-hospitality', 'Events and hospitality', 5),
  ('real-estate-home', 'Real estate and home services', 6),
  ('legal-finance', 'Legal and finance', 7),
  ('education-courses', 'Education and courses', 8),
  ('retail-product', 'Retail and product', 9),
  ('other-services', 'Other services', 10);

CREATE TABLE public.touchpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT,
  kind TEXT NOT NULL,
  source TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX touchpoints_email_idx ON public.touchpoints (lower(email));
CREATE INDEX touchpoints_profile_idx ON public.touchpoints (profile_id);
GRANT SELECT ON public.touchpoints TO authenticated;
GRANT ALL ON public.touchpoints TO service_role;
ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read their own touchpoints" ON public.touchpoints FOR SELECT TO authenticated USING (
  profile_id = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  OR public.has_role(auth.uid(), 'admin')
);

ALTER TABLE public.profiles ADD COLUMN industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL;