import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import type { BingoFix } from "@/lib/bingo";
import { FOLLOWUP_ORDER, followupDue, renderFollowupEmail } from "@/lib/bingo-followups";
import { stageForScore } from "@/lib/stages";

/**
 * Called on a schedule (Lovable Cloud cron, every 30 minutes) to send the
 * Findability Bingo follow-up emails: the two Beauty Weekend deadline nudges
 * and the 3-day follow-up. Only to people who said yes to marketing email,
 * never twice, at most one email per person per run, and never to anyone who
 * has booked a call on Calendly.
 */
async function sendFollowups(request: Request): Promise<Response> {
  const denied = await authenticateCronRequest(request);
  if (denied) return denied;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { hasBookedCall, calendlyConfigured } = await import("@/lib/calendly.server");
  const { triggerN8nEmail } = await import("@/lib/n8n-email.server");
  const now = new Date();

  const { data: rows, error } = await supabaseAdmin
    .from("score_submissions")
    .select("token, email, full_name, total_score, top_fixes, consent_email, created_at, person_id")
    .eq("answers->>kind", "bingo")
    .gte("created_at", "2026-09-25T00:00:00Z")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("send-bingo-followups query failed", error.message);
    return json({ ok: false }, 500);
  }

  // One person, one sequence: her latest card decides, including whether she still wants email.
  const latest = new Map<string, NonNullable<typeof rows>[number]>();
  for (const row of rows ?? []) {
    const key = row.email.toLowerCase();
    if (!latest.has(key)) latest.set(key, row);
  }

  const { data: sentRows, error: sentError } = await supabaseAdmin
    .from("touchpoints")
    .select("email, detail")
    .in("kind", ["bingo_followup", "call_booked"])
    .gte("created_at", "2026-09-25T00:00:00Z");
  if (sentError) {
    console.error("send-bingo-followups sent lookup failed", sentError.message);
    return json({ ok: false }, 500);
  }
  const sent = new Set<string>();
  const booked = new Set<string>();
  for (const row of sentRows ?? []) {
    const detail = (row.detail ?? {}) as { kind?: string; booked?: boolean };
    const email = (row.email ?? "").toLowerCase();
    if (detail.booked) booked.add(email);
    else if (detail.kind) sent.add(`${email}:${detail.kind}`);
  }

  const counts = { sent: 0, skippedBooked: 0, deferred: 0, failed: 0 };

  for (const [email, row] of latest) {
    if (!row.consent_email || booked.has(email)) continue;
    const scoredAt = new Date(row.created_at);
    const kind = FOLLOWUP_ORDER.find(
      (k) => !sent.has(`${email}:${k}`) && followupDue(k, scoredAt, now),
    );
    if (!kind) continue;

    const hasBooked = await hasBookedCall(email);
    if (hasBooked === true) {
      counts.skippedBooked += 1;
      await supabaseAdmin.from("touchpoints").insert({
        email,
        person_id: row.person_id,
        kind: "call_booked",
        source: "calendly",
        detail: { booked: true, detectedBy: "bingo_followups" },
      });
      if (row.person_id) {
        await supabaseAdmin
          .from("people")
          .update({ lead_stage: "call_booked" })
          .eq("id", row.person_id)
          .in("lead_stage", ["new", "contacted"]);
      }
      continue;
    }
    // Calendly is connected but did not answer: try her again next run rather than risk it.
    if (hasBooked === null && calendlyConfigured()) {
      counts.deferred += 1;
      continue;
    }

    const rendered = renderFollowupEmail({
      kind,
      fullName: row.full_name,
      token: row.token,
      total: row.total_score,
      stage: stageForScore(row.total_score).name,
      fixes: (row.top_fixes as BingoFix[]) ?? [],
    });
    const result = await triggerN8nEmail({
      event: "rendered_email",
      idempotencyKey: `bingo_followup:${kind}:${email}`,
      recipient: { email, fullName: row.full_name },
      data: { kind, ...rendered },
    });
    if (!result.sent) {
      counts.failed += 1;
      continue;
    }

    await supabaseAdmin.from("touchpoints").insert({
      email,
      person_id: row.person_id,
      kind: "bingo_followup",
      source: "beauty-weekend-bingo",
      detail: { kind, token: row.token },
    });
    counts.sent += 1;
  }

  return json({ ok: true, ...counts, calendlyConnected: calendlyConfigured() });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/cron/send-bingo-followups")({
  server: {
    handlers: {
      GET: ({ request }) => sendFollowups(request),
      POST: ({ request }) => sendFollowups(request),
    },
  },
});
