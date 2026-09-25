import { BEAUTY_CODE, BEAUTY_ENDS_AT, type BingoFix } from "@/lib/bingo";
import { CALENDLY_LINKS } from "@/lib/calendly";
import { SITE } from "@/lib/site";

/**
 * The Findability Bingo follow-up sequence, sent by /cron/send-bingo-followups
 * to people who ticked the marketing email box and have not booked a call.
 *
 * - beauty_saturday: Saturday of Beauty Weekend, "$50 code ends Sunday"
 * - beauty_last_chance: Sunday afternoon/evening, "ends tonight"
 * - followup_3day: three days after they scored (and after the weekend)
 */
export type FollowupKind = "beauty_saturday" | "beauty_last_chance" | "followup_3day";

export const FOLLOWUP_ORDER: FollowupKind[] = [
  "beauty_saturday",
  "beauty_last_chance",
  "followup_3day",
];

const HOUR = 3600_000;
const DAY = 24 * HOUR;

/** Saturday Sep 26, 10am ET until Sunday 10am ET. */
const SATURDAY_FROM = new Date("2026-09-26T14:00:00Z");
const SATURDAY_TO = new Date("2026-09-27T14:00:00Z");
/** Sunday Sep 27, 3pm ET until 11pm ET: an hour before the code dies, stop. */
const LAST_CHANCE_FROM = new Date("2026-09-27T19:00:00Z");
const LAST_CHANCE_TO = new Date(BEAUTY_ENDS_AT.getTime() - HOUR);

/** Is this email due for this person right now? */
export function followupDue(kind: FollowupKind, scoredAt: Date, now: Date): boolean {
  const age = now.getTime() - scoredAt.getTime();
  switch (kind) {
    case "beauty_saturday":
      // Someone who scored Saturday evening goes straight to the last-chance email instead.
      return now >= SATURDAY_FROM && now < SATURDAY_TO && age >= 3 * HOUR;
    case "beauty_last_chance":
      return now >= LAST_CHANCE_FROM && now < LAST_CHANCE_TO && age >= 2 * HOUR;
    case "followup_3day":
      return now > BEAUTY_ENDS_AT && age >= 3 * DAY && age < 30 * DAY;
  }
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function unsubscribeUrl(token: string) {
  return `${SITE.url}/unsubscribe?t=${encodeURIComponent(token)}`;
}

export function emailFooter(token: string) {
  const url = unsubscribeUrl(token);
  return {
    text: `\n—\n${SITE.legalName}, ${SITE.city}, FL\nYou're getting this because you played Findability Bingo at Beauty Weekend and said yes to emails. Unsubscribe: ${url}`,
    html: `<p style="font-size:12px;color:#8a7a7e;margin-top:28px">${esc(SITE.legalName)}, ${esc(SITE.city)}, FL<br>You're getting this because you played Findability Bingo at Beauty Weekend and said yes to emails. <a href="${esc(url)}" style="color:#8a7a7e">Unsubscribe</a></p>`,
  };
}

type FollowupInput = {
  kind: FollowupKind;
  fullName: string;
  token: string;
  total: number;
  stage: string;
  fixes: BingoFix[];
};

const wrap = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2a1d20;line-height:1.55">${body}</div>`;

const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="background:#a3284a;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">${esc(label)}</a></p>`;

export function renderFollowupEmail(input: FollowupInput) {
  const first = esc(input.fullName.trim().split(/\s+/)[0] || "there");
  const firstText = input.fullName.trim().split(/\s+/)[0] || "there";
  const resultUrl = `${SITE.url}/bingo/r/${input.token}`;
  const bookUrl = `${resultUrl}#book`;
  const footer = emailFooter(input.token);
  const topFix = input.fixes[0];

  if (input.kind === "beauty_saturday") {
    const subject = `${firstText}, your $50 strategy call code ends Sunday`;
    const text = `Hi ${firstText},

You scored ${input.total}/100 at Findability Bingo (you're a ${input.stage}).

${topFix ? `Your #1 fix: ${topFix.title}.\n\n` : ""}If you want me to map out exactly how to get found on Google and in AI answers, the 2-hour 1:1 Strategy Call is $50 instead of $200 with code ${BEAUTY_CODE}, only until Sunday at 11:59pm ET.

Enter the code on your results page: ${bookUrl}

Or start with a free 30-minute Clarity Call: ${CALENDLY_LINKS["clarity-call"]}

Manasa
${SITE.name}${footer.text}`;
    const html = wrap(`<p>Hi ${first},</p>
<p>You scored <strong>${input.total}/100</strong> at Findability Bingo (you're a <strong>${esc(input.stage)}</strong>).</p>
${topFix ? `<p>Your #1 fix: <strong>${esc(topFix.title)}</strong>.</p>` : ""}
<p>If you want me to map out exactly how to get found on Google and in AI answers, the 2-hour 1:1 Strategy Call is <strong>$50 instead of $200</strong> with code <strong>${BEAUTY_CODE}</strong>, only until Sunday at 11:59pm ET.</p>
${button(bookUrl, `Use code ${BEAUTY_CODE}`)}
<p>Or start with a <a href="${CALENDLY_LINKS["clarity-call"]}" style="color:#a3284a">free 30-minute Clarity Call</a>.</p>
<p>Manasa<br>${esc(SITE.name)}</p>${footer.html}`);
    return { subject, text, html };
  }

  if (input.kind === "beauty_last_chance") {
    const subject = `Tonight at midnight: $50 strategy call goes back to $200`;
    const text = `Hi ${firstText},

Quick one: code ${BEAUTY_CODE} stops working tonight at 11:59pm ET.

After that the 2-hour 1:1 Strategy Call goes back to $200. On the call we go through your ${input.total}/100 score and build your plan to show up on Google, ChatGPT and Gemini.

Book it for $50 here: ${bookUrl}

Manasa${footer.text}`;
    const html = wrap(`<p>Hi ${first},</p>
<p>Quick one: code <strong>${BEAUTY_CODE}</strong> stops working <strong>tonight at 11:59pm ET</strong>.</p>
<p>After that the 2-hour 1:1 Strategy Call goes back to $200. On the call we go through your ${input.total}/100 score and build your plan to show up on Google, ChatGPT and Gemini.</p>
${button(bookUrl, "Book it for $50")}
<p>Manasa</p>${footer.html}`);
    return { subject, text, html };
  }

  const fixes = input.fixes.slice(0, 3);
  const subject = `Your 3 findability fixes, ${firstText}`;
  const text = `Hi ${firstText},

It's been a few days since Findability Bingo. Here are the three fixes that will move your score the most:

${fixes.map((f, i) => `${i + 1}. ${f.title}\n   ${f.how}`).join("\n\n")}

Your full list is here: ${resultUrl}

If you'd rather talk it through, book a free 30-minute Clarity Call and we'll pick the one fix that pays back fastest: ${CALENDLY_LINKS["clarity-call"]}

Manasa
${SITE.name}${footer.text}`;
  const html = wrap(`<p>Hi ${first},</p>
<p>It's been a few days since Findability Bingo. Here are the three fixes that will move your score the most:</p>
<ol style="padding-left:20px">${fixes
    .map(
      (f) =>
        `<li style="margin-bottom:12px"><strong>${esc(f.title)}</strong><br><span style="color:#5a4a4e">${esc(f.how)}</span></li>`,
    )
    .join("")}</ol>
<p><a href="${esc(resultUrl)}" style="color:#a3284a">See your full list</a></p>
<p>If you'd rather talk it through, book a free Clarity Call and we'll pick the one fix that pays back fastest.</p>
${button(CALENDLY_LINKS["clarity-call"], "Book a free Clarity Call")}
<p>Manasa<br>${esc(SITE.name)}</p>${footer.html}`);
  return { subject, text, html };
}
