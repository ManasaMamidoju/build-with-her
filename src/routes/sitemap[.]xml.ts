import { createFileRoute } from "@tanstack/react-router";

import { ARTICLES } from "@/lib/learn";
import { SERVICES } from "@/lib/services";
import { canonical } from "@/lib/site";

const STATIC_PATHS = [
  "/",
  "/about",
  "/score",
  "/services",
  "/podcast",
  "/podcast/book",
  "/learn",
  "/blog",
  "/community",
  "/events",
  "/contact",
  "/terms",
  "/privacy",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: blogPosts } = await supabaseAdmin
          .from("blog_posts")
          .select("slug")
          .eq("status", "published");

        const paths = [
          ...STATIC_PATHS,
          ...SERVICES.map((service) => `/services/${service.slug}`),
          ...ARTICLES.map((article) => `/learn/${article.slug}`),
          ...(blogPosts ?? []).map((post) => `/blog/${post.slug}`),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${canonical(path)}</loc></url>`).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
