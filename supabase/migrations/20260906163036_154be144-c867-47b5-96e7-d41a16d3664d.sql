-- Podcast applications
CREATE TABLE public.podcast_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  instagram text,
  website text,
  city text,
  format text NOT NULL DEFAULT 'street',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text,
  status text NOT NULL DEFAULT 'applied',
  notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcast_applications TO authenticated;
GRANT INSERT ON public.podcast_applications TO anon;
GRANT ALL ON public.podcast_applications TO service_role;
ALTER TABLE public.podcast_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.podcast_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Team reads applications" ON public.podcast_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager') OR profile_id = auth.uid());
CREATE POLICY "Team updates applications" ON public.podcast_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));
CREATE POLICY "Admins delete applications" ON public.podcast_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_podcast_applications_updated_at BEFORE UPDATE ON public.podcast_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  interview_id uuid REFERENCES public.interviews(id) ON DELETE SET NULL,
  type text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  stage text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at timestamptz,
  due_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team manages projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));
CREATE POLICY "Members read their own projects" ON public.projects FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Project stages
CREATE TABLE public.project_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'todo',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_stages TO authenticated;
GRANT ALL ON public.project_stages TO service_role;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team manages stages" ON public.project_stages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));
CREATE POLICY "Members read their own stages" ON public.project_stages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.profile_id = auth.uid()));

-- Deliverables
CREATE TABLE public.deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'short_form',
  title text NOT NULL,
  raw_url text,
  edited_url text,
  final_url text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  editor_due_at timestamptz,
  stage text NOT NULL DEFAULT 'not_started',
  revisions_used smallint NOT NULL DEFAULT 0,
  revisions_allowed smallint NOT NULL DEFAULT 2,
  cm_approved boolean NOT NULL DEFAULT false,
  admin_approved boolean NOT NULL DEFAULT false,
  approved_for_posting boolean NOT NULL DEFAULT false,
  review_due_at timestamptz,
  published_url text,
  team_notes text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated;
GRANT ALL ON public.deliverables TO service_role;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team manages deliverables" ON public.deliverables FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));
CREATE POLICY "Editors read assigned deliverables" ON public.deliverables FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());
CREATE POLICY "Editors update assigned deliverables" ON public.deliverables FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());
CREATE POLICY "Members read their own deliverables" ON public.deliverables FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.profile_id = auth.uid()));
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Deliverable reviews
CREATE TABLE public.deliverable_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id uuid NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.deliverable_reviews TO authenticated;
GRANT ALL ON public.deliverable_reviews TO service_role;
ALTER TABLE public.deliverable_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team reads reviews" ON public.deliverable_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager') OR reviewer_id = auth.uid());
CREATE POLICY "Members review their own deliverables" ON public.deliverable_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.deliverables d JOIN public.projects p ON p.id = d.project_id
    WHERE d.id = deliverable_id AND p.profile_id = auth.uid()));

-- Episodes
CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  guest_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  interview_id uuid REFERENCES public.interviews(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  youtube_url text,
  published_at timestamptz,
  article_md text,
  transcript_url text,
  note_image_url text,
  is_public boolean NOT NULL DEFAULT false,
  collaborator_added boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT SELECT ON public.episodes TO anon;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads public episodes" ON public.episodes FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "Team manages episodes" ON public.episodes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));
CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Guest pages
CREATE TABLE public.guest_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE SET NULL,
  interview_id uuid REFERENCES public.interviews(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  full_name text NOT NULL,
  business_name text,
  bio text,
  photo_url text,
  website text,
  links jsonb NOT NULL DEFAULT '{}'::jsonb,
  city text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_pages TO authenticated;
GRANT SELECT ON public.guest_pages TO anon;
GRANT ALL ON public.guest_pages TO service_role;
ALTER TABLE public.guest_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads public guest pages" ON public.guest_pages FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "Team manages guest pages" ON public.guest_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));
CREATE TRIGGER update_guest_pages_updated_at BEFORE UPDATE ON public.guest_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Partners
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  contact_email text,
  referral_code text NOT NULL UNIQUE,
  commission_pct numeric(5,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage partners" ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  converted boolean NOT NULL DEFAULT false,
  commission_cents integer NOT NULL DEFAULT 0,
  attributed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage referrals" ON public.referrals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Monthly metrics
CREATE TABLE public.metrics_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period date NOT NULL,
  stage text NOT NULL,
  metric_key text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, period, stage, metric_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metrics_entries TO authenticated;
GRANT ALL ON public.metrics_entries TO service_role;
ALTER TABLE public.metrics_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their own numbers" ON public.metrics_entries FOR ALL TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_metrics_entries_updated_at BEFORE UPDATE ON public.metrics_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX projects_profile_idx ON public.projects(profile_id);
CREATE INDEX deliverables_project_idx ON public.deliverables(project_id);
CREATE INDEX deliverables_assigned_idx ON public.deliverables(assigned_to);
CREATE INDEX metrics_profile_period_idx ON public.metrics_entries(profile_id, period);