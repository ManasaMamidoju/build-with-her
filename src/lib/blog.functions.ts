import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Public: view counts back the "most viewed" sort on the blog index. */
export const getBlogViewCounts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("blog_post_views").select("slug, views");
  if (error) {
    console.error("read blog view counts failed", error.message);
    return {} as Record<string, number>;
  }
  return Object.fromEntries((data ?? []).map((row) => [row.slug, row.views]));
});

export const recordBlogView = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().trim().min(1).max(80) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("increment_blog_post_view", { _slug: data.slug });
    if (error) console.error("record blog view failed", error.message);
    return { ok: true as const };
  });
