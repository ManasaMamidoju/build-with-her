-- View counts for the blog. Post content itself lives in code (src/lib/blog.ts,
-- same pattern as the Learn explainers); this table only backs the "most
-- viewed" sort on the blog index.
CREATE TABLE public.blog_post_views (
  slug text PRIMARY KEY,
  views bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_post_views TO anon, authenticated;
GRANT ALL ON public.blog_post_views TO service_role;
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog view counts" ON public.blog_post_views
  FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.increment_blog_post_view(_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.blog_post_views (slug, views, updated_at)
  VALUES (_slug, 1, now())
  ON CONFLICT (slug) DO UPDATE
    SET views = public.blog_post_views.views + 1, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_blog_post_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(text) TO anon, authenticated;
