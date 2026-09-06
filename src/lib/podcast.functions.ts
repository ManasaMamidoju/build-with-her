import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { STAGE_TEMPLATES } from "@/lib/project-templates";

async function assertPodcastTeam(context: { supabase: any; userId: string }) {
  for (const role of ["admin", "content_manager"] as const) {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (data === true) return;
  }
  throw new Error("Forbidden");
}

const applySchema = z.object({
  fullName: z.string().trim().min(1, "Tell us your name").max(120),
  email: z.string().trim().email("That email does not look right").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  instagram: z.string().trim().max(160).optional().or(z.literal("")),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  format: z.enum(["street", "long"]),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  answers: z.record(z.string(), z.string().max(2000)),
});

export const applyForPodcast = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => applySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { assertNotFlooding } = await import("@/lib/rate-limit.server");
    await assertNotFlooding({
      email,
      kind: "podcast_application",
      maxInWindow: 2,
      message: "We already have your application. We reply within five working days.",
    });

    const { error } = await supabaseAdmin.from("podcast_applications").insert({
      full_name: data.fullName,
      email,
      phone: data.phone || null,
      business_name: data.businessName || null,
      instagram: data.instagram || null,
      website: data.website || null,
      city: data.city || null,
      format: data.format,
      source: data.source || null,
      answers: data.answers,
    });

    if (error) {
      console.error("podcast application failed", error.message);
      throw new Error("We could not send that. Please try again.");
    }

    const { error: touchError } = await supabaseAdmin.from("touchpoints").insert({
      email,
      kind: "podcast_application",
      source: data.source || null,
      detail: { format: data.format, business: data.businessName ?? null },
    });
    if (touchError) console.error("touchpoint write failed", touchError.message);

    return { ok: true as const };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPodcastTeam(context);
    const { data, error } = await context.supabase
      .from("podcast_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.string().trim().max(40).optional(),
  format: z.enum(["street", "long"]).optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertPodcastTeam(context);
    const { id, ...rest } = data;
    const patch = JSON.parse(JSON.stringify(rest)) as Record<string, unknown>;
    patch['reviewed_by'] = context.userId;
    patch['reviewed_at'] = new Date().toISOString();
    const table = context.supabase.from("podcast_applications") as any;
    const { error } = await table.update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Turns an approved application into a podcast project with its stages and one deliverable. */
export const startPodcastProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertPodcastTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: application } = await supabaseAdmin
      .from("podcast_applications")
      .select("id, full_name, business_name, email, format, profile_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!application) throw new Error("We cannot find that application.");

    let profileId = application.profile_id as string | null;
    if (!profileId && application.email) {
      const { data: match } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", application.email)
        .maybeSingle();
      profileId = match?.id ?? null;
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .insert({
        profile_id: profileId,
        type: "podcast",
        name: `${application.format === "long" ? "Long-form" : "Street-style"} interview: ${application.full_name}`,
        stage: "Paid",
        owner_id: context.userId,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !project) throw new Error("We could not start that project.");

    await supabaseAdmin.from("project_stages").insert(
      STAGE_TEMPLATES.podcast.map((name, index) => ({
        project_id: project.id,
        name,
        sort_order: index,
        status: index === 0 ? "doing" : "todo",
      })),
    );

    await supabaseAdmin.from("deliverables").insert({
      project_id: project.id,
      kind: application.format === "long" ? "long_form" : "short_form",
      title: `${application.full_name} interview`,
      revisions_allowed: application.format === "long" ? 0 : 2,
    });

    const table2 = supabaseAdmin.from("podcast_applications") as any;
    await table2.update({ status: "approved" }).eq("id", data.id);

    return { projectId: project.id as string };
  });
