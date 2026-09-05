const STORAGE_KEY = "bwhm.source";

export type CapturedSource = {
  src: string;
  ref: string | null;
  landing: string;
  capturedAt: string;
};

function clean(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, 80);
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * First-touch capture: the first link she ever arrives on wins, so later
 * visits do not overwrite where she originally found us. Reads ?src= and
 * ?ref= from the address bar. Safe to call on every page load.
 */
export function captureSourceFromLocation(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const src = clean(params.get("src"));
    const ref = clean(params.get("ref"));
    const referrer = clean(document.referrer);
    if (!src && !ref && !referrer) return;
    const payload: CapturedSource = {
      src: src ?? (referrer ? "referral" : "direct"),
      ref,
      landing: window.location.pathname.slice(0, 200),
      capturedAt: new Date().toISOString(),
    };
    if (!src && referrer) {
      payload.src = referrer;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable in private windows; the quiz still works.
  }
}

export function getCapturedSource(): CapturedSource | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CapturedSource;
    if (!parsed || typeof parsed.src !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}
