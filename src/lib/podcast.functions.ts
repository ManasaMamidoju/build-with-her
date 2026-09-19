import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { STAGE_TEMPLATES } from "@/lib/project-templates";
import type { AuthedContext } from "@/lib/server-context";
import type { Database } from "@/integrations/supabase/types";

async function assertPodcastTeam(context: AuthedContext) {
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
  phone: z.string().trim().min(1, "Tell us your phone number").max(40),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  instagram: z.string().trim().max(160).optional().or(z.literal("")),
  socialTags: z.string().trim().min(1, "List at least one platform and handle").max(400),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Tell us where you live").max(120),
  format: z.enum(["street", "long"]),
  source: z.string().trim().min(1, "Tell us who referred you").max(120),
  stage: z.string().trim().max(40).optional().or(z.literal("")),
  decisionMaker: z.boolean(),
  socialMediaOptimized: z.enum(["yes", "no", "more_info"]),
  youtubeChannel: z.enum(["yes", "no", "not_yet"]),
  hasHighTicketOffer: z.boolean(),
  hasOffer: z.enum(["yes", "no", "unsure"]),
  monthlyRevenue: z.enum(["0-5k", "5k-10k", "10k-25k", "25k-50k", "50k-100k", "100k-plus"]),
  tourFocus: z.enum(["authority", "sales", "both"]),
  wantsPodcastTour: z.enum(["yes", "no", "more_info"]),
  openToVipInvestment: z.enum(["yes", "no", "more_info"]),
  willPromote: z.boolean(),
  professionalToneOk: z.boolean(),
  wantsCommunity: z.boolean(),
  agreedToTerms: z.literal(true, { message: "You need to agree to these terms to apply" }),
  answers: z.record(z.string(), z.string().max(2000)),
});

const FEATURED_STAGES = new Set(["Bloom", "Garden"]);
const REVENUE_LABELS: Record<string, string> = {
  "0-5k": "$0-$5,000",
  "5k-10k": "$5,000-$10,000",
  "10k-25k": "$10,000-$25,000",
  "25k-50k": "$25,000-$50,000",
  "50k-100k": "$50,000-$100,000",
  "100k-plus": "$100k or more",
};

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
      phone: data.phone,
      business_name: data.businessName || null,
      instagram: data.instagram || null,
      social_tags: data.socialTags,
      website: data.website || null,
      city: data.city,
      format: data.format,
      source: data.source,
      stage: data.stage || null,
      suggested_featured: FEATURED_STAGES.has(data.stage ?? ""),
      decision_maker: data.decisionMaker,
      social_media_optimized: data.socialMediaOptimized,
      youtube_channel: data.youtubeChannel,
      has_high_ticket_offer: data.hasHighTicketOffer,
      has_offer: data.hasOffer,
      monthly_revenue: REVENUE_LABELS[data.monthlyRevenue] ?? data.monthlyRevenue,
      tour_focus: data.tourFocus,
      wants_podcast_tour: data.wantsPodcastTour,
      open_to_vip_investment: data.openToVipInvestment,
      will_promote: data.willPromote,
      professional_tone_ok: data.professionalToneOk,
      wants_community: data.wantsCommunity,
      agreed_to_terms: data.agreedToTerms,
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
    const patch = JSON.parse(
      JSON.stringify(rest),
    ) as Database["public"]["Tables"]["podcast_applications"]["Update"];
    patch.reviewed_by = context.userId;
    patch.reviewed_at = new Date().toISOString();
    const { error } = await context.supabase
      .from("podcast_applications")
      .update(patch)
      .eq("id", id);
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

    await supabaseAdmin
      .from("podcast_applications")
      .update({ status: "approved" })
      .eq("id", data.id);

    return { projectId: project.id as string };
  });
