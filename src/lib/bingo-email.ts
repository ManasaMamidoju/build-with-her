import { AREAS } from "@/lib/score-rubric";
import { BEAUTY_CODE, BEAUTY_ENDS_LABEL, beautyOfferLive, type BingoFix } from "@/lib/bingo";
import { CALENDLY_LINKS } from "@/lib/calendly";
import { SITE } from "@/lib/site";
import { unsubscribeUrl } from "@/lib/bingo-followups";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The instant email: score, character, fixes, and (only here and on the results page) the two calls. */
export function renderBingoResultEmail(input: {
  fullName: string;
  total: number;
  stage: string;
  stageTagline: string;
  fixes: BingoFix[];
  resultUrl: string;
  token: string;
  /** Set once the live scan has checked her card against her real website and profiles. */
  verified?: { selfTotal: number; checkedCount: number };
  now?: Date;
}) {
  const first = input.fullName.trim().split(/\s+/)[0] || "there";
  const live = beautyOfferLive(input.now);
  const subject = input.verified
    ? `We checked your website and profiles: your verified score is ${input.total}/100`
    : `You're a ${input.stage}: your Findability Score is ${input.total}/100`;
  const verifiedLine = input.verified
    ? `We scanned your website, Google profile, socials and AI answers and checked ${input.verified.checkedCount} of your squares. Your card said ${input.verified.selfTotal}; your verified score is ${input.total}.`
    : null;

  const offerText = live
    ? `2. 1:1 Strategy Call, $50 instead of $200 with code ${BEAUTY_CODE}. Enter the code on your results page before ${BEAUTY_ENDS_LABEL}:\n${input.resultUrl}#book`
    : `2. 1:1 Strategy Call ($200): ${input.resultUrl}#book`;

  const text = [
    `Hi ${first},`,
    "",
    ...(verifiedLine ? [verifiedLine, ""] : []),
    `You're a ${input.stage}. ${input.stageTagline}`,
    `Your Findability Score: ${input.total} out of 100.`,
    "",
    "Your next steps to rank higher on Google (SEO), answer engines (AEO) and AI search (GEO):",
    ...input.fixes.map(
      (fix, i) => `${i + 1}. ${fix.title} [${fix.tags.join(", ")}]\n   ${fix.how}`,
    ),
    "",
    `See your full result any time: ${input.resultUrl}`,
    "",
    "Want help doing this?",
    `1. Free Clarity Call (30 min): ${CALENDLY_LINKS["clarity-call"]}`,
    offerText,
    "",
    "Manasa",
    SITE.name,
    "",
    `${SITE.legalName}, ${SITE.city}, FL. You're getting this because you asked for your score at ${SITE.url}/bingo. Unsubscribe from marketing emails: ${unsubscribeUrl(input.token)}`,
  ].join("\n");

  const fixesHtml = input.fixes
    .map(
      (fix, i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #f0dfe2;vertical-align:top;width:28px;font-weight:700;color:#a3284a">${i + 1}.</td><td style="padding:10px 0;border-bottom:1px solid #f0dfe2"><strong>${esc(fix.title)}</strong> <span style="font-size:12px;color:#a3284a">${fix.tags.join(" · ")} · ${esc(AREAS[fix.area].short)}</span><br><span style="color:#5a4a4e">${esc(fix.how)}</span></td></tr>`,
    )
    .join("");

  const offerHtml = live
    ? `<p style="margin:8px 0"><a href="${esc(input.resultUrl)}#book" style="color:#a3284a;font-weight:700">1:1 Strategy Call: $50 instead of $200 with code ${BEAUTY_CODE}</a><br><span style="font-size:13px;color:#5a4a4e">Enter the code on your results page before ${BEAUTY_ENDS_LABEL}. The price goes back to $200 after Beauty Weekend.</span></p>`
    : `<p style="margin:8px 0"><a href="${esc(input.resultUrl)}#book" style="color:#a3284a;font-weight:700">1:1 Strategy Call ($200)</a></p>`;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2a1d20;line-height:1.5">
<p>Hi ${esc(first)},</p>${verifiedLine ? `<p>${esc(verifiedLine)}</p>` : ""}
<p style="font-size:22px;margin:16px 0 4px"><strong>You're a ${esc(input.stage)}.</strong></p>
<p style="margin:0 0 8px;color:#5a4a4e">${esc(input.stageTagline)}</p>
<p style="font-size:18px;margin:8px 0 20px">Findability Score: <strong>${input.total}</strong> / 100</p>
<p><strong>Your next steps</strong> to rank higher on Google (SEO), answer engines (AEO) and AI search (GEO):</p>
<table style="width:100%;border-collapse:collapse">${fixesHtml}</table>
<p style="margin:20px 0"><a href="${esc(input.resultUrl)}" style="background:#a3284a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">See your full result</a></p>
<div style="background:#f6e3e6;border-radius:16px;padding:16px 20px;margin:24px 0">
<p style="margin:0 0 8px"><strong>Want help doing this?</strong></p>
<p style="margin:8px 0"><a href="${CALENDLY_LINKS["clarity-call"]}" style="color:#a3284a;font-weight:700">Book a free Clarity Call (30 min)</a></p>
${offerHtml}
</div>
<p>Manasa<br>${esc(SITE.name)}</p>
<p style="font-size:12px;color:#8a7a7e">${esc(SITE.legalName)}, ${esc(SITE.city)}, FL<br>You're getting this because you asked for your Findability Score at ${esc(SITE.url)}/bingo. <a href="${esc(unsubscribeUrl(input.token))}" style="color:#8a7a7e">Unsubscribe from marketing emails</a></p>
</div>`;

  return { subject, text, html };
}
