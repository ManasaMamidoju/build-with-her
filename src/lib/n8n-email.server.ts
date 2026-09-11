import { createHmac } from "crypto";

type EmailAutomation =
  | {
      event: "score_result";
      idempotencyKey: string;
      recipient: { email: string; fullName: string };
      data: { total: number; band: string; bandLine: string; resultUrl: string };
    }
  | {
      event: "waitlist_confirm";
      idempotencyKey: string;
      recipient: { email: string; fullName: string };
      data: { serviceName: string; serviceUrl: string; scoreUrl: string };
    };

export async function triggerN8nEmail(payload: EmailAutomation) {
  const webhookUrl = process.env['N8N_EMAIL_WEBHOOK_URL'];
  const webhookSecret = process.env['N8N_EMAIL_WEBHOOK_SECRET'];

  if (!webhookUrl || !webhookSecret) {
    console.warn(`n8n email skipped: ${payload.event} is not connected`);
    return { sent: false as const, reason: "not_configured" as const };
  }

  const body = JSON.stringify({
    version: 1,
    occurredAt: new Date().toISOString(),
    ...payload,
  });
  const signature = createHmac("sha256", webhookSecret).update(body).digest("hex");
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BWH-Signature": `sha256=${signature}`,
      "Idempotency-Key": payload.idempotencyKey,
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`n8n email failed [${response.status}]: ${errorBody}`);
    return { sent: false as const, reason: "provider_error" as const };
  }

  return { sent: true as const };
}