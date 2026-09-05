import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  AREA_ORDER,
  AREA_POINTS,
  bandFor,
  QUESTIONS,
  type AreaKey,
} from "@/lib/score-rubric";

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
  details: detailsSchema,
});

function makeToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function score(answers: Record<string, string>) {
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

  return { areaScores, total, topFixes, band: bandFor(total) };
}

export const submitScore = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = score(data.answers);
    const token = makeToken();

    const { error } = await supabaseAdmin.from("score_submissions").insert({
      token,
      full_name: data.details.fullName,
      email: data.details.email.toLowerCase(),
      business_name: data.details.businessName || null,
      website: data.details.website || null,
      phone: data.details.phone || null,
      primary_source: data.details.source || null,
      answers: data.answers,
      area_scores: result.areaScores,
      total_score: result.total,
      band: result.band.name,
      top_fixes: result.topFixes,
    });

    if (error) {
      console.error("score submit failed", error.message);
      throw new Error("We could not save your score. Please try again.");
    }

    const { error: touchError } = await supabaseAdmin.from("touchpoints").insert({
      email: data.details.email.toLowerCase(),
      kind: "score_submit",
      source: data.details.source || null,
      detail: { token, total: result.total, band: result.band.name },
    });
    if (touchError) {
      console.error("touchpoint write failed", touchError.message);
    }

    return { token };
  });

export type ScoreResult = {
  fullName: string;
  businessName: string | null;
  total: number;
  band: string;
  bandLine: string;
  areaScores: { area: AreaKey; earned: number; outOf: number }[];
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
        "full_name, business_name, total_score, band, area_scores, top_fixes, created_at",
      )
      .eq("token", data.token)
      .maybeSingle();

    if (error) {
      console.error("score read failed", error.message);
      throw new Error("We could not load this score.");
    }
    if (!row) return null;

    const band = bandFor(row.total_score);

    return {
      fullName: row.full_name,
      businessName: row.business_name,
      total: row.total_score,
      band: row.band ?? band.name,
      bandLine: band.line,
      areaScores: (row.area_scores as ScoreResult["areaScores"]) ?? [],
      topFixes: (row.top_fixes as ScoreResult["topFixes"]) ?? [],
      createdAt: row.created_at,
    };
  });
