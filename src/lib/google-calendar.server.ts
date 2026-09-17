import { createSign, randomUUID } from "crypto";

/**
 * Writes confirmed bookings onto Manasa's real Google Calendar via a
 * service account (server-to-server, no per-user OAuth consent). Every
 * function here no-ops quietly when GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON /
 * GOOGLE_CALENDAR_ID aren't set yet, the same way n8n-email.server.ts
 * behaves before its webhook is connected.
 */

type ServiceAccount = { client_email: string; private_key: string };

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env["GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON"];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.client_email || !parsed.private_key) return null;
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  } catch {
    console.error("GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON is not valid JSON");
    return null;
  }
}

function encodeSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function getAccessToken(account: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encodeSegment({ alg: "RS256", typ: "JWT" })}.${encodeSegment({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(account.private_key, "base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });

  if (!response.ok) {
    console.error("Google Calendar auth failed", await response.text());
    return null;
  }
  const json = (await response.json()) as { access_token?: string };
  return json.access_token ?? null;
}

type UpsertOptions = {
  googleEventId: string | null;
  /** Omit on an update-only-the-time call so the existing title/description survive. */
  summary?: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  attendeeEmail?: string;
};

export async function upsertCalendarEvent(
  options: UpsertOptions,
): Promise<{ googleEventId: string; meetLink: string | null } | null> {
  const account = getServiceAccount();
  const calendarId = process.env["GOOGLE_CALENDAR_ID"];
  if (!account || !calendarId) return null;

  const token = await getAccessToken(account);
  if (!token) return null;

  const isUpdate = Boolean(options.googleEventId);
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const url = isUpdate ? `${base}/${options.googleEventId}` : `${base}?conferenceDataVersion=1`;

  const body: Record<string, unknown> = {
    start: { dateTime: options.startsAt },
    end: { dateTime: options.endsAt },
    ...(options.summary !== undefined ? { summary: options.summary } : {}),
    ...(options.description !== undefined ? { description: options.description } : {}),
    ...(options.attendeeEmail ? { attendees: [{ email: options.attendeeEmail }] } : {}),
  };
  if (!isUpdate) {
    body["conferenceData"] = {
      createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
    };
  }

  const response = await fetch(url, {
    method: isUpdate ? "PATCH" : "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Google Calendar event upsert failed", await response.text());
    return null;
  }

  const event = (await response.json()) as {
    id: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
  };
  const meetLink =
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ??
    null;

  return { googleEventId: event.id, meetLink };
}

export async function deleteCalendarEvent(googleEventId: string): Promise<void> {
  const account = getServiceAccount();
  const calendarId = process.env["GOOGLE_CALENDAR_ID"];
  if (!account || !calendarId) return;

  const token = await getAccessToken(account);
  if (!token) return;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok && response.status !== 410 && response.status !== 404) {
    console.error("Google Calendar event delete failed", await response.text());
  }
}
