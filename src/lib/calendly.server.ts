/**
 * Read-only Calendly lookups with a personal access token
 * (Calendly > Integrations > API and webhooks). Works on every Calendly plan.
 */
const CALENDLY_USER_URI = "https://api.calendly.com/users/3bf1012c-2a1a-4393-8c36-f7f1ad0d6dac";

/** Anything booked from Beauty Weekend onward counts as "she booked". */
const BOOKED_SINCE = "2026-09-25T00:00:00Z";

export function calendlyConfigured() {
  return Boolean(process.env["CALENDLY_API_TOKEN"]);
}

/**
 * Has this email booked any call (clarity, strategy or BEAUTY) with us?
 * Returns null when Calendly is not connected or did not answer, so the
 * caller can decide what to do without a guess.
 */
export async function hasBookedCall(email: string): Promise<boolean | null> {
  const token = process.env["CALENDLY_API_TOKEN"];
  if (!token) return null;

  const params = new URLSearchParams({
    user: CALENDLY_USER_URI,
    invitee_email: email,
    min_start_time: BOOKED_SINCE,
    status: "active",
    count: "1",
  });
  try {
    const response = await fetch(`https://api.calendly.com/scheduled_events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error(`calendly lookup failed [${response.status}]`);
      return null;
    }
    const body = (await response.json()) as { collection?: unknown[] };
    return (body.collection?.length ?? 0) > 0;
  } catch (error) {
    console.error("calendly lookup failed", error);
    return null;
  }
}
