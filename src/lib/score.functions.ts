import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  AREA_ORDER,
  AREA_POINTS,
  bandFor,
  petalStateFor,
  QUESTIONS,
  THORN_QUESTIONS,
  WITH_THORNS_THRESHOLD,
  type AreaKey,
} from "@/lib/score-rubric";
import { SITE } from "@/lib/site";

const handle = z.string().trim().max(160).optional().or(z.literal(""));

const detailsSchema = z.object({
  fullName: z.string().trim().min(1, "Tell us your name").max(120),
  email: z.string().trim().email("That email does not look right").max(255),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  handles: z
    .object({
      instagram: handle,
      facebook: handle,
      tiktok: handle,
      youtube: handle,
      linkedin: handle,
      pinterest: handle,
      other: handle,
    })
    .optional(),
  consentTerms: z.literal(true, { message: "Please accept the terms to see your score" }),
  consentEmail: z.boolean().optional(),
  consentSms: z.boolean().optional(),
  consentCommunity: z.boolean().optional(),
});

const submitSchema = z.object({
  answers: z.record(z.string().max(60), z.string().max(60)),
  thornAnswers: z.record(z.string().max(60), z.string().max(60)).optional().default({}),
  details: detailsSchema,
});

function makeToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function score(answers: Record<string, string>, thornAnswers: Record<string, string>) {
  const areaEarned = AREA_ORDER.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<AreaKey, number>,
  );

  const gaps: { id: string; fix: string; missing: number; area: AreaKey }[] = [];

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    const choice = question.choices.find((c) => c.value === answer);
    const credit = choice ? choice.credit : 0;
    const earned = question.points * credit;
    areaEarned[question.area] += earned;
    if (credit < 1) {
      gaps.push({
        id: question.id,
        fix: question.fix,
        missing: question.points - earned,
        area: question.area,
      });
    }
  }

  const areaScores = AREA_ORDER.map((key) => ({
    area: key,
    earned: Math.round(areaEarned[key]),
    outOf: AREA_POINTS[key],
  }));

  const total = Math.max(
    0,
    Math.min(100, Math.round(areaScores.reduce((sum, a) => sum + areaEarned[a.area], 0))),
  );

  const topFixes = gaps
    .sort((a, b) => b.missing - a.missing)
    .slice(0, 3)
    .map((gap) => ({ area: gap.area, fix: gap.fix }));

  const petals = areaScores
    .filter((a) => petalStateFor(a.earned, a.outOf) === "petal")
    .map((a) => a.area);
  const thorns = areaScores
    .filter((a) => petalStateFor(a.earned, a.outOf) === "thorn")
    .map((a) => a.area);

  let thornScore = 0;
  for (const question of THORN_QUESTIONS) {
    const answer = thornAnswers[question.id];
    const choice = question.choices.find((c) => c.value === answer);
    thornScore += choice ? Math.round(question.points * choice.credit) : 0;
  }
  const withThorns = thornScore >= WITH_THORNS_THRESHOLD;

  const band = bandFor(total);

  return { areaScores, total, topFixes, band, petals, thorns, thornScore, withThorns };
}

export const submitScore = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertNotFlooding } = await import("@/lib/rate-limit.server");
    await assertNotFlooding({
      email: data.details.email.toLowerCase(),
      kind: "score_submit",
      maxInWindow: 5,
      message: "You have taken this a few times just now. Come back in an hour.",
    });
    const result = score(data.answers, data.thornAnswers);
    const token = makeToken();

    const { data: bandRow } = await supabaseAdmin
      .from("band_rules")
      .select("stage_name")
      .eq("band", result.band.name)
      .maybeSingle();
    const stageName = bandRow?.stage_name ?? result.band.name;

    const email = data.details.email.toLowerCase();
    const { data: personId, error: personError } = await supabaseAdmin.rpc(
      "people_find_or_create",
      {
        _full_name: data.details.fullName,
        _email: email,
        ...(data.details.businessName ? { _business_name: data.details.businessName } : {}),
        ...(data.details.phone ? { _phone: data.details.phone } : {}),
        _source: data.details.source || "findability_score",
      },
    );
    if (personError || !personId) {
      console.error("score person link failed", personError?.message);
      throw new Error("We could not save your score. Please try again.");
    }

    const { data: submission, error } = await supabaseAdmin
      .from("score_submissions")
      .insert({
        token,
        full_name: data.details.fullName,
        email,
        business_name: data.details.businessName || null,
        website: data.details.website || null,
        phone: data.details.phone || null,
        primary_source: data.details.source || null,
        handles: Object.fromEntries(
          Object.entries(data.details.handles ?? {}).filter(([, value]) => Boolean(value)),
        ),
        consent_email: data.details.consentEmail ?? false,
        consent_sms: data.details.consentSms ?? false,
        consent_community: data.details.consentCommunity ?? false,
        consent_terms_at: new Date().toISOString(),
        answers: { ...data.answers, ...data.thornAnswers },
        area_scores: result.areaScores,
        total_score: result.total,
        band: result.band.name,
        top_fixes: result.topFixes,
        person_id: personId,
        thorn_score: result.thornScore,
        with_thorns: result.withThorns,
        stage: stageName,
        petals: result.petals,
        thorns: result.thorns,
      })
      .select("id")
      .single();

    if (error) {
      console.error("score submit failed", error.message);
      throw new Error("We could not save your score. Please try again.");
    }

    const { error: touchError } = await supabaseAdmin.from("touchpoints").insert({
      email,
      person_id: personId,
      kind: "score_submit",
      source: data.details.source || null,
      detail: { token, total: result.total, band: result.band.name, stage: stageName },
    });
    if (touchError) {
      console.error("touchpoint write failed", touchError.message);
    }

    if (submission) {
      const { data: bandDetail } = await supabaseAdmin
        .from("band_rules")
        .select("stage_tagline")
        .eq("band", result.band.name)
        .maybeSingle();

      const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
      await triggerN8nEmail({
        event: "score_result",
        idempotencyKey: `score_result:${submission.id}`,
        recipient: { email, fullName: data.details.fullName },
        data: {
          total: result.total,
          band: result.band.name,
          bandLine: result.band.line,
          stage: stageName + (result.withThorns ? " with thorns" : ""),
          stageTagline: bandDetail?.stage_tagline ?? result.band.line,
          resultUrl: `${SITE.url}/score/r/${token}`,
        },
      });
    }

    return { token };
  });

export type ScoreResult = {
  fullName: string;
  businessName: string | null;
  total: number;
  band: string;
  bandLine: string;
  stage: string;
  stageTagline: string;
  stageWorking: string;
  stageMissing: string;
  stageNextStep: string;
  withThorns: boolean;
  thornScore: number;
  primaryServiceSlug: string | null;
  secondaryServiceSlug: string | null;
  areaScores: { area: AreaKey; earned: number; outOf: number }[];
  petals: AreaKey[];
  thorns: AreaKey[];
  topFixes: { area: AreaKey; fix: string }[];
  createdAt: string;
};

export const getScoreByToken = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(20).max(80) }).parse(data))
  .handler(async ({ data }): Promise<ScoreResult | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("score_submissions")
      .select(
        "full_name, business_name, total_score, band, area_scores, top_fixes, created_at, stage, petals, thorns, thorn_score, with_thorns",
      )
      .eq("token", data.token)
      .maybeSingle();

    if (error) {
      console.error("score read failed", error.message);
      throw new Error("We could not load this score.");
    }
    if (!row) return null;

    const band = bandFor(row.total_score);
    const { data: bandRow } = await supabaseAdmin
      .from("band_rules")
      .select(
        "stage_name, stage_tagline, stage_working, stage_missing, stage_next_step, primary_service_slug, secondary_service_slug",
      )
      .eq("band", row.band ?? band.name)
      .maybeSingle();

    const withThorns = row.with_thorns ?? false;

    return {
      fullName: row.full_name,
      businessName: row.business_name,
      total: row.total_score,
      band: row.band ?? band.name,
      bandLine: band.line,
      stage: row.stage ?? bandRow?.stage_name ?? band.name,
      stageTagline: bandRow?.stage_tagline ?? band.line,
      stageWorking: bandRow?.stage_working ?? "",
      stageMissing: bandRow?.stage_missing ?? "",
      stageNextStep: bandRow?.stage_next_step ?? "",
      withThorns,
      thornScore: row.thorn_score ?? 0,
      // The with-thorns flag always points to the build, whatever the stage.
      primaryServiceSlug: withThorns ? "automation-build" : (bandRow?.primary_service_slug ?? null),
      secondaryServiceSlug: withThorns
        ? "strategy-consult"
        : (bandRow?.secondary_service_slug ?? null),
      areaScores: (row.area_scores as ScoreResult["areaScores"]) ?? [],
      petals: (row.petals as AreaKey[]) ?? [],
      thorns: (row.thorns as AreaKey[]) ?? [],
      topFixes: (row.top_fixes as ScoreResult["topFixes"]) ?? [],
      createdAt: row.created_at,
    };
  });
