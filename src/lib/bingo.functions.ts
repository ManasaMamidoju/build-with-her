import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  BEAUTY_CODE,
  BEAUTY_ENDS_AT,
  BINGO_IDS,
  BINGO_SOURCE,
  CONSENT_COPY,
  MYSTERY_SQUARES,
  beautyOfferLive,
  scoreBingo,
  type BingoFix,
} from "@/lib/bingo";
import { CALENDLY_BEAUTY_STRATEGY_LINK, CALENDLY_LINKS } from "@/lib/calendly";
import { BANDS, type AreaKey } from "@/lib/score-rubric";
import { SITE } from "@/lib/site";
import { STAGES } from "@/lib/stages";

const handle = z.string().trim().max(160).optional().or(z.literal(""));

const submitSchema = z.object({
  checked: z.record(z.string().max(40), z.boolean()),
  mysteryText: z.record(z.string().max(40), z.string().trim().max(200)).optional().default({}),
  details: z.object({
    fullName: z.string().trim().min(1, "Tell us your name").max(120),
    email: z.string().trim().email("That email does not look right").max(255),
    businessName: z.string().trim().min(1, "Tell us your business name").max(160),
    website: z.string().trim().max(255).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    source: z.string().trim().max(80).optional().or(z.literal("")),
    handles: z.object({
      instagram: handle,
      tiktok: handle,
      facebook: handle,
      other: handle,
    }),
    consentTerms: z.literal(true, { message: "Please accept the terms and privacy notice" }),
    consentEmail: z.boolean(),
    consentSms: z.boolean(),
  }),
});

function makeToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function stageFor(total: number) {
  const index = BANDS.findIndex((band) => total >= band.min && total <= band.max);
  return STAGES[Math.max(0, index)]!;
}

export const submitBingo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertNotFlooding } = await import("@/lib/rate-limit.server");
    const email = data.details.email.toLowerCase();
    await assertNotFlooding({
      email,
      kind: "score_submit",
      maxInWindow: 5,
      message: "You have scored a few times just now. Come back in an hour.",
    });

    // Only keep squares that exist on the card.
    const checked = Object.fromEntries(
      BINGO_IDS.filter((id) => data.checked[id] === true).map((id) => [id, true]),
    );
    const mysteryText = Object.fromEntries(
      MYSTERY_SQUARES.map((s) => [s.id, data.mysteryText[s.id] ?? ""]).filter(([, v]) => v),
    );
    const result = scoreBingo(checked);
    const stage = stageFor(result.total);
    const token = makeToken();
    const now = new Date().toISOString();
    const phone = data.details.phone || null;
    // SMS consent means nothing without a number to text.
    const consentSms = Boolean(phone) && data.details.consentSms;

    const { data: personId, error: personError } = await supabaseAdmin.rpc(
      "people_find_or_create",
      {
        _full_name: data.details.fullName,
        _email: email,
        _business_name: data.details.businessName,
        ...(phone ? { _phone: phone } : {}),
        _source: BINGO_SOURCE,
      },
    );
    if (personError || !personId) {
      console.error("bingo person link failed", personError?.message);
      throw new Error("We could not save your score. Please try again.");
    }

    const { data: submission, error } = await supabaseAdmin
      .from("score_submissions")
      .insert({
        token,
        full_name: data.details.fullName,
        email,
        business_name: data.details.businessName,
        website: data.details.website || null,
        phone,
        primary_source: data.details.source || BINGO_SOURCE,
        handles: Object.fromEntries(
          Object.entries(data.details.handles).filter(([, value]) => Boolean(value)),
        ),
        consent_email: data.details.consentEmail,
        consent_sms: consentSms,
        consent_community: false,
        consent_terms_at: now,
        answers: {
          kind: "bingo",
          checked,
          mysteryText,
          bingos: result.bingos,
          consent: {
            at: now,
            email: data.details.consentEmail ? CONSENT_COPY.email : null,
            sms: consentSms ? CONSENT_COPY.sms : null,
            terms: CONSENT_COPY.terms,
          },
        },
        area_scores: result.areaScores,
        total_score: result.total,
        band: result.band.name,
        top_fixes: result.fixes,
        person_id: personId,
        stage: stage.name,
        petals: result.petals,
        thorns: result.thorns,
      } as never)
      .select("id")
      .single();

    if (error || !submission) {
      console.error("bingo submit failed", error?.message);
      throw new Error("We could not save your score. Please try again.");
    }

    const { error: touchError } = await supabaseAdmin.from("touchpoints").insert({
      email,
      person_id: personId,
      kind: "score_submit",
      source: BINGO_SOURCE,
      detail: {
        token,
        total: result.total,
        band: result.band.name,
        stage: stage.name,
        bingo: true,
      },
    });
    if (touchError) console.error("touchpoint write failed", touchError.message);

    // The score email is what she asked for, so it goes whatever she ticked for marketing.
    const resultUrl = `${SITE.url}/bingo/r/${token}`;
    const { renderBingoResultEmail } = await import("@/lib/bingo-email");
    const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
    const rendered = renderBingoResultEmail({
      fullName: data.details.fullName,
      total: result.total,
      stage: stage.name,
      stageTagline: stage.tagline,
      fixes: result.fixes,
      resultUrl,
    });
    try {
      const sent = await triggerN8nEmail({
        event: "rendered_email",
        idempotencyKey: `bingo_result:${submission.id}`,
        recipient: { email, fullName: data.details.fullName },
        data: { kind: "bingo_result", ...rendered },
      });
      // An n8n workflow that predates rendered_email answers "unknown event":
      // fall back to the plain score email it already knows how to send.
      if (!sent.sent && sent.reason === "provider_error") {
        await triggerN8nEmail({
          event: "score_result",
          idempotencyKey: `score_result:${submission.id}`,
          recipient: { email, fullName: data.details.fullName },
          data: {
            total: result.total,
            band: result.band.name,
            bandLine: result.band.line,
            stage: stage.name,
            stageTagline: stage.tagline,
            resultUrl,
          },
        });
      }
    } catch (emailError) {
      console.error("bingo email failed", emailError);
    }

    return { token };
  });

export type BingoResult = {
  firstName: string;
  businessName: string | null;
  total: number;
  stage: string;
  stageTagline: string;
  stageDescription: string;
  stageImage: string;
  stageAlt: string;
  areaScores: { area: AreaKey; earned: number; outOf: number }[];
  fixes: BingoFix[];
  checked: Record<string, boolean>;
  mysteryText: Record<string, string>;
  bingos: number;
  clarityCallUrl: string;
  strategyCallUrl: string;
  beautyLive: boolean;
  beautyEndsAt: string;
};

export const getBingoResult = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(20).max(80) }).parse(data))
  .handler(async ({ data }): Promise<BingoResult | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("score_submissions")
      .select("full_name, business_name, total_score, area_scores, top_fixes, answers")
      .eq("token", data.token)
      .maybeSingle();

    if (error) {
      console.error("bingo read failed", error.message);
      throw new Error("We could not load this score.");
    }
    const answers = (row?.answers ?? {}) as {
      kind?: string;
      checked?: Record<string, boolean>;
      mysteryText?: Record<string, string>;
      bingos?: number;
    };
    if (!row || answers.kind !== "bingo") return null;

    const stage = stageFor(row.total_score);
    return {
      firstName: row.full_name.trim().split(/\s+/)[0] ?? row.full_name,
      businessName: row.business_name,
      total: row.total_score,
      stage: stage.name,
      stageTagline: stage.tagline,
      stageDescription: stage.description,
      stageImage: stage.image,
      stageAlt: stage.alt,
      areaScores: (row.area_scores as BingoResult["areaScores"]) ?? [],
      fixes: (row.top_fixes as BingoFix[]) ?? [],
      checked: answers.checked ?? {},
      mysteryText: answers.mysteryText ?? {},
      bingos: answers.bingos ?? 0,
      clarityCallUrl: CALENDLY_LINKS["clarity-call"],
      strategyCallUrl: CALENDLY_LINKS["strategy-consult"],
      beautyLive: beautyOfferLive(),
      beautyEndsAt: BEAUTY_ENDS_AT.toISOString(),
    };
  });

/** Checks the code on the server so the $50 link is only handed out while the weekend is on. */
export const unlockBeautyOffer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().trim().max(40), token: z.string().min(20).max(80) }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!beautyOfferLive()) {
      return { ok: false as const, reason: "expired" as const };
    }
    if (data.code.toUpperCase() !== BEAUTY_CODE) {
      return { ok: false as const, reason: "invalid" as const };
    }
    // Logging who unlocked it must never stop her from booking.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("score_submissions")
        .select("email, person_id")
        .eq("token", data.token)
        .maybeSingle();
      if (row) {
        const { error } = await supabaseAdmin.from("touchpoints").insert({
          email: row.email,
          person_id: row.person_id,
          kind: "offer_unlocked",
          source: BINGO_SOURCE,
          detail: { code: BEAUTY_CODE, token: data.token },
        });
        if (error) console.error("offer touchpoint failed", error.message);
      }
    } catch (logError) {
      console.error("offer unlock log failed", logError);
    }
    return { ok: true as const, url: CALENDLY_BEAUTY_STRATEGY_LINK };
  });
