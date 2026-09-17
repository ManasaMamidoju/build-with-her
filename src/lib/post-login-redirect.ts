const KEY = "bwhm.post-login-redirect";

/** Where to send her after she signs in, when a public page sent her to /login first. */
export function rememberPostLoginRedirect(path: string) {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // storage unavailable; she just lands on the home page after signing in
  }
}

export function takePostLoginRedirect(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
