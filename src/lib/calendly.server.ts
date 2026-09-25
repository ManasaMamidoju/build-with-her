/**
 * Read-only Calendly lookups.
 *
 * Preferred path: the Calendly connector, called through the Lovable connector
 * gateway (CALENDLY_API_KEY + LOVABLE_API_KEY). The gateway refreshes the
 * Calendly token for us, so nothing here expires.
 *
 * Fallback: a personal access token in CALENDLY_API_TOKEN
 * (Calendly > Integrations > API and webhooks), called directly.
 */
const CALENDLY_USER_URI = "https://api.calendly.com/users/3bf1012c-2a1a-4393-8c36-f7f1ad0d6dac";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/calendly";
const DIRECT_URL = "https://api.calendly.com";

/** Anything booked from Beauty Weekend onward counts as "she booked". */
const BOOKED_SINCE = "2026-09-25T00:00:00Z";

function gatewayCreds() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["CALENDLY_API_KEY"];
  if (!lovableKey || !connectionKey) return null;
  return { lovableKey, connectionKey };
}

export function calendlyConfigured() {
  return Boolean(gatewayCreds() || process.env["CALENDLY_API_TOKEN"]);
}

/** One request against whichever Calendly path is configured. */
async function calendlyGet(path: string, params: URLSearchParams): Promise<Response | null> {
  const creds = gatewayCreds();
  if (creds) {
    return fetch(`${GATEWAY_URL}${path}?${params}`, {
      headers: {
        Authorization: `Bearer ${creds.lovableKey}`,
        "X-Connection-Api-Key": creds.connectionKey,
      },
    });
  }
  const token = process.env["CALENDLY_API_TOKEN"];
  if (!token) return null;
  return fetch(`${DIRECT_URL}${path}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Has this email booked any call (clarity, strategy or BEAUTY) with us?
 * Returns null when Calendly is not connected or did not answer, so the
 * caller can decide what to do without a guess.
 */
export async function hasBookedCall(email: string): Promise<boolean | null> {
  const params = new URLSearchParams({
    user: CALENDLY_USER_URI,
    invitee_email: email,
    min_start_time: BOOKED_SINCE,
    status: "active",
    count: "1",
  });
  try {
    const response = await calendlyGet("/scheduled_events", params);
    if (!response) return null;
    if (!response.ok) {
      console.error(`calendly lookup failed [${response.status}]: ${await response.text()}`);
      return null;
    }
    const body = (await response.json()) as { collection?: unknown[] };
    return (body.collection?.length ?? 0) > 0;
  } catch (error) {
    console.error("calendly lookup failed", error);
    return null;
  }
}
