import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AREA_ORDER, type AreaKey } from "@/lib/score-rubric";

export type ScoreSummary = {
  id: string;
  token: string;
  total: number;
  band: string;
  createdAt: string;
  areaScores: { area: AreaKey; earned: number; outOf: number }[];
  topFixes: { area: AreaKey; fix: string }[];
};

function normaliseAreas(raw: unknown): { area: AreaKey; earned: number; outOf: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (row): row is { area: AreaKey; earned: number; outOf: number } =>
        Boolean(row) && typeof row === "object" && "area" in (row as object),
    )
    .sort((a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area));
}

/** Attaches any scores taken with her email to her account, then reads them back. */
export const getMyScores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = String(context.claims["email"] ?? "").toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (email) {
      await supabaseAdmin
        .from("score_submissions")
        .update({ claimed_by: context.userId })
        .is("claimed_by", null)
        .eq("email", email);
    }

    const { data, error } = await context.supabase
      .from("score_submissions")
      .select("id, token, total_score, band, created_at, area_scores, top_fixes")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("read scores failed", error.message);
      return [] as ScoreSummary[];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      token: row.token,
      total: row.total_score,
      band: row.band,
      createdAt: row.created_at,
      areaScores: normaliseAreas(row.area_scores),
      topFixes: Array.isArray(row.top_fixes)
        ? (row.top_fixes as { area: AreaKey; fix: string }[])
        : [],
    })) satisfies ScoreSummary[];
  });

export const getMyOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileRes, bookingRes] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("full_name, email, business_name, phone, consent_community")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("bookings")
        .select("id, service_slug, starts_at, ends_at, status")
        .neq("status", "cancelled")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5),
    ]);

    return {
      profile: profileRes.data ?? null,
      bookings: bookingRes.data ?? [],
    };
  });

export const getMySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileRes, handlesRes, industriesRes] = await Promise.all([
      context.supabase
        .from("profiles")
        .select(
          "full_name, email, business_name, phone, industry_id, consent_email, consent_sms, consent_community",
        )
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("person_handles")
        .select("platform, handle")
        .eq("profile_id", context.userId),
      context.supabase.from("industries").select("id, name").order("sort_order"),
    ]);

    return {
      profile: profileRes.data ?? null,
      handles: handlesRes.data ?? [],
      industries: industriesRes.data ?? [],
    };
  });

const settingsSchema = z.object({
  fullName: z.string().trim().max(120),
  businessName: z.string().trim().max(160),
  phone: z.string().trim().max(40),
  industryId: z.string().uuid().nullable(),
  consentEmail: z.boolean(),
  consentSms: z.boolean(),
  consentCommunity: z.boolean(),
  handles: z
    .array(
      z.object({ platform: z.string().trim().min(1).max(40), handle: z.string().trim().max(120) }),
    )
    .max(10),
});

export const saveMySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => settingsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.fullName || null,
        business_name: data.businessName || null,
        phone: data.phone || null,
        industry_id: data.industryId,
        consent_email: data.consentEmail,
        consent_sms: data.consentSms,
        consent_community: data.consentCommunity,
      })
      .eq("id", context.userId);

    if (error) {
      console.error("save settings failed", error.message);
      throw new Error("We could not save your details. Please try again.");
    }

    for (const row of data.handles) {
      if (!row.handle) {
        await context.supabase
          .from("person_handles")
          .delete()
          .eq("profile_id", context.userId)
          .eq("platform", row.platform);
        continue;
      }
      await context.supabase
        .from("person_handles")
        .upsert(
          { profile_id: context.userId, platform: row.platform, handle: row.handle },
          { onConflict: "profile_id,platform" },
        );
    }

    return { ok: true as const };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) {
      console.error("delete account failed", error.message);
      throw new Error("We could not close your account. Email us and we will do it by hand.");
    }
    return { ok: true as const };
  });
