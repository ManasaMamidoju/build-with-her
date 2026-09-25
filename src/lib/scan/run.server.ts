import { scoreBingo } from "@/lib/bingo";
import { checkAiVisibility } from "@/lib/scan/ai-visibility.server";
import { scanFacebook, scanGoogle, scanInstagram, scanTikTok } from "@/lib/scan/apify.server";
import { applyVerification, deriveFromScan, type ScanData } from "@/lib/scan/verify";
import { scanWebsite } from "@/lib/scan/website.server";
import { SITE } from "@/lib/site";
import { stageForScore } from "@/lib/stages";

/** A scan that has been "running" this long died with its request; start it again. */
const STALE_MS = 5 * 60_000;

type BingoAnswers = {
  kind?: string;
  checked?: Record<string, boolean>;
  city?: string;
  service?: string;
  scan?: ScanData;
  [key: string]: unknown;
};

export type ScanRunResult = { status: "done" | "running" | "failed" | "missing" };

/**
 * Run the live scan for one bingo submission, then re-score it. Safe to call
 * repeatedly: a finished scan is never redone, a fresh running one is left alone.
 */
export async function runScanForToken(token: string): Promise<ScanRunResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row, error } = await supabaseAdmin
    .from("score_submissions")
    .select("id, email, full_name, business_name, website, handles, answers")
    .eq("token", token)
    .maybeSingle();
  if (error || !row) return { status: "missing" };

  const answers = (row.answers ?? {}) as BingoAnswers;
  if (answers.kind !== "bingo") return { status: "missing" };
  const prior = answers.scan;
  if (prior?.status === "done") return { status: "done" };
  if (prior?.status === "running" && Date.now() - new Date(prior.startedAt).getTime() < STALE_MS) {
    return { status: "running" };
  }

  const startedAt = new Date().toISOString();
  const city = answers.city?.trim() || null;
  const service = answers.service?.trim() || null;
  const running: ScanData = {
    status: "running",
    startedAt,
    city,
    service,
    website: null,
    instagram: null,
    tiktok: null,
    facebook: null,
    google: null,
    ai: null,
    unchecked: [],
  };
  await supabaseAdmin
    .from("score_submissions")
    .update({ answers: { ...answers, scan: running } } as never)
    .eq("id", row.id);

  const handles = (row.handles ?? {}) as Record<string, string | undefined>;
  const businessName = row.business_name ?? row.full_name;

  try {
    const googleP = scanGoogle(businessName, city);
    const [website, instagram, tiktok, facebook, google, ai] = await Promise.all([
      row.website ? scanWebsite(row.website, city) : Promise.resolve(null),
      handles["instagram"] ? scanInstagram(handles["instagram"]) : Promise.resolve(null),
      handles["tiktok"] ? scanTikTok(handles["tiktok"]) : Promise.resolve(null),
      handles["facebook"] ? scanFacebook(handles["facebook"]) : Promise.resolve(null),
      googleP,
      (async () => {
        let aiService = service;
        let aiCity = city;
        if (!aiService || !aiCity) {
          const g = await googleP;
          aiService ||= g?.category ?? null;
          aiCity ||= g?.city ?? null;
        }
        if (!aiService || !aiCity) return null;
        return checkAiVisibility({
          businessName,
          service: aiService,
          city: aiCity,
          website: row.website,
        });
      })(),
    ]);

    const unchecked: string[] = [];
    if (row.website && !website) unchecked.push("Website");
    if (handles["instagram"] && !instagram) unchecked.push("Instagram");
    if (handles["tiktok"] && !tiktok) unchecked.push("TikTok");
    if (handles["facebook"] && !facebook) unchecked.push("Facebook");
    if (!google) unchecked.push("Google Business Profile");
    if (!ai) unchecked.push("AI answers");

    const scan: ScanData = {
      status: "done",
      startedAt,
      finishedAt: new Date().toISOString(),
      city: city ?? google?.city ?? null,
      service: service ?? google?.category ?? instagram?.category ?? null,
      website,
      instagram,
      tiktok,
      facebook,
      google,
      ai,
      unchecked,
    };

    const selfReported = answers.checked ?? {};
    const { verified, extraFixes, forceFixIds } = deriveFromScan(scan);
    const finalChecked = applyVerification(selfReported, verified);
    const result = scoreBingo(finalChecked, { extraFixes, forceFixIds });
    const stage = stageForScore(result.total);
    const selfTotal = scoreBingo(selfReported).total;

    const { error: saveError } = await supabaseAdmin
      .from("score_submissions")
      .update({
        answers: { ...answers, scan, verified, selfTotal },
        total_score: result.total,
        area_scores: result.areaScores,
        top_fixes: result.fixes,
        band: result.band.name,
        stage: stage.name,
        petals: result.petals,
        thorns: result.thorns,
      } as never)
      .eq("id", row.id);
    if (saveError) {
      console.error("scan save failed", saveError.message);
      return { status: "failed" };
    }

    const { renderBingoResultEmail } = await import("@/lib/bingo-email");
    const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
    const rendered = renderBingoResultEmail({
      fullName: row.full_name,
      total: result.total,
      stage: stage.name,
      stageTagline: stage.tagline,
      fixes: result.fixes,
      resultUrl: `${SITE.url}/bingo/r/${token}`,
      token,
      verified: { selfTotal, checkedCount: Object.keys(verified).length },
    });
    await triggerN8nEmail({
      event: "rendered_email",
      idempotencyKey: `bingo_scan:${row.id}`,
      recipient: { email: row.email, fullName: row.full_name },
      data: { kind: "bingo_scan_result", ...rendered },
    }).catch((e) => console.error("scan email failed", e));

    return { status: "done" };
  } catch (scanError) {
    console.error("scan failed", scanError);
    await supabaseAdmin
      .from("score_submissions")
      .update({
        answers: {
          ...answers,
          scan: { ...running, status: "failed", finishedAt: new Date().toISOString() },
        },
      } as never)
      .eq("id", row.id);
    return { status: "failed" };
  }
}
