const TOKEN_KEY = "bwhm.score.token";

/** Remember the last score this browser made, so we can show her the right first step. */
export function rememberScoreToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage blocked, nothing to do
  }
}

export function getRememberedScoreToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
