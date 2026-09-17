import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { BlogPost } from "@/lib/blog";
import type { AuthedContext } from "@/lib/server-context";
import type { Database } from "@/integrations/supabase/types";

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

function rowToPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.published_at,
    readMinutes: row.read_minutes,
    tags: row.tags,
    intro: row.intro,
    sections: row.sections as { heading: string; body: string[] }[],
    takeaways: row.takeaways,
    cta: { label: row.cta_label, to: row.cta_to as BlogPost["cta"]["to"] },
    ...(row.interview_guest_name
      ? {
          interview: {
            guestName: row.interview_guest_name,
            businessName: row.interview_business_name ?? "",
            instagramUrl: row.interview_instagram_url ?? "",
            ...(row.interview_business_website
              ? { businessWebsite: row.interview_business_website }
              : {}),
            ...(row.interview_backlink_label
              ? { backlinkLabel: row.interview_backlink_label }
              : {}),
          },
        }
      : {}),
  };
}

async function assertContentTeam(context: AuthedContext) {
  for (const role of ["admin", "content_manager"] as const) {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (data === true) return;
  }
  throw new Error("Forbidden");
}

/* --------------------------------- public -------------------------------- */

export const getPublishedBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("list blog posts failed", error.message);
    return [] as BlogPost[];
  }
  return (data ?? []).map(rowToPost);
});

export const getPublishedBlogPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().trim().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return row ? rowToPost(row) : null;
  });

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

/* ----------------------------- content team ------------------------------ */

export const amIBlogEditor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertContentTeam(context);
      return { canEdit: true };
    } catch {
      return { canEdit: false };
    }
  });

export const listBlogPostsForTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertContentTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, slug, title, status, published_at, interview_guest_name")
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBlogPostForTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertContentTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("We cannot find that post.");
    return row;
  });

const sectionSchema = z.object({
  heading: z.string().trim().min(1).max(200),
  body: z.array(z.string().trim().min(1).max(4000)).min(1).max(20),
});

const blogPostInput = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(400),
  publishedAt: z.string().trim().min(1).max(20),
  readMinutes: z.number().int().min(1).max(60),
  tags: z.array(z.string().trim().min(1).max(60)).max(10),
  intro: z.string().trim().min(1).max(4000),
  sections: z.array(sectionSchema).min(1).max(20),
  takeaways: z.array(z.string().trim().min(1).max(400)).max(10),
  ctaLabel: z.string().trim().min(1).max(120),
  ctaTo: z.enum(["/score/quiz", "/services", "/podcast"]),
  status: z.enum(["draft", "published"]),
  interviewGuestName: z.string().trim().max(160).optional().or(z.literal("")),
  interviewBusinessName: z.string().trim().max(200).optional().or(z.literal("")),
  interviewInstagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  interviewBusinessWebsite: z.string().trim().max(300).optional().or(z.literal("")),
  interviewBacklinkLabel: z.string().trim().max(160).optional().or(z.literal("")),
});

function toRowInput(data: z.infer<typeof blogPostInput>) {
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    published_at: data.publishedAt,
    read_minutes: data.readMinutes,
    tags: data.tags,
    intro: data.intro,
    sections: data.sections,
    takeaways: data.takeaways,
    cta_label: data.ctaLabel,
    cta_to: data.ctaTo,
    status: data.status,
    interview_guest_name: data.interviewGuestName || null,
    interview_business_name: data.interviewBusinessName || null,
    interview_instagram_url: data.interviewInstagramUrl || null,
    interview_business_website: data.interviewBusinessWebsite || null,
    interview_backlink_label: data.interviewBacklinkLabel || null,
  };
}

export const createBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => blogPostInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertContentTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .insert({ ...toRowInput(data), created_by: context.userId, updated_by: context.userId })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("A post with that slug already exists.");
      throw new Error(error.message);
    }
    return { id: row.id as string };
  });

export const updateBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => blogPostInput.extend({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertContentTeam(context);
    const { id, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .update({ ...toRowInput(rest), updated_by: context.userId })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") throw new Error("A post with that slug already exists.");
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertContentTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
