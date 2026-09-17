-- Blog posts move from static code (src/lib/blog.ts) into the database so
-- content managers and admins can edit copy and add social/website links
-- from the studio without a code deploy.
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  published_at date NOT NULL DEFAULT current_date,
  read_minutes smallint NOT NULL DEFAULT 5,
  tags text[] NOT NULL DEFAULT '{}',
  intro text NOT NULL,
  -- [{ heading: string, body: string[] }]
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  takeaways text[] NOT NULL DEFAULT '{}',
  cta_label text NOT NULL DEFAULT 'Take the Findability Score',
  cta_to text NOT NULL DEFAULT '/score/quiz',
  -- Guest interview metadata: who we talked to and where to follow/visit them.
  interview_guest_name text,
  interview_business_name text,
  interview_instagram_url text,
  interview_business_website text,
  interview_backlink_label text,
  status text NOT NULL DEFAULT 'published',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_cta_to_check CHECK (cta_to IN ('/score/quiz', '/services', '/podcast')),
  CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published'))
);

CREATE INDEX blog_posts_published_idx ON public.blog_posts (published_at DESC)
  WHERE status = 'published';

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;

CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Team can read every post" ON public.blog_posts
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager')
  );

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
