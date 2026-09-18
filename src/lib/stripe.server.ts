import { createHmac, timingSafeEqual } from "crypto";

/**
 * Stripe Checkout over raw fetch, no SDK — same shape as
 * google-calendar.server.ts and n8n-email.server.ts: every function here
 * no-ops quietly when STRIPE_SECRET_KEY isn't set yet, so paid bookings keep
 * working on the manual-invoice path until a live key is connected.
 */

type CheckoutSessionOptions = {
  bookingId: string;
  serviceName: string;
  amountCents: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

function getSecretKey(): string | null {
  return process.env["STRIPE_SECRET_KEY"] || null;
}

export function stripeConfigured(): boolean {
  return getSecretKey() !== null;
}

function toFormBody(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export async function createCheckoutSession(
  options: CheckoutSessionOptions,
): Promise<{ url: string; sessionId: string } | null> {
  const secretKey = getSecretKey();
  if (!secretKey) return null;

  const body = toFormBody({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(options.amountCents),
    "line_items[0][price_data][product_data][name]": options.serviceName,
    customer_email: options.customerEmail,
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    "metadata[booking_id]": options.bookingId,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    console.error("Stripe checkout session create failed", await response.text());
    return null;
  }

  const session = (await response.json()) as { id: string; url: string | null };
  if (!session.url) return null;
  return { url: session.url, sessionId: session.id };
}

/**
 * Verifies the `Stripe-Signature` header the way Stripe's SDK does, without
 * depending on the SDK: HMAC-SHA256 over `${timestamp}.${rawBody}` using the
 * webhook signing secret, compared to the `v1=` value(s) in the header.
 */
export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value] as [string, string];
    }),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const expected = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
