// The app runs on the owner's own Supabase project.
// The generated .env is rewritten with the built-in project's values, so the
// server-side Supabase variables must be re-pointed at the owner's project.
//
// On the Cloudflare Worker runtime, secrets are injected per request, not at
// module load, so this MUST be re-applied on every request (see
// src/lib/supabase-target-middleware.ts) as well as at import time.

// Public values for the owner's project (same as the ones pinned in vite.config.ts).
const OWNER_SUPABASE_URL = "https://srqnyhwknkpqrajefwjs.supabase.co";
const OWNER_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fjSs-jThuB_rEiAJgIddTw_ZMkTFPhz";

export function applyOwnerSupabaseEnv() {
  const url = process.env["EXTERNAL_SUPABASE_URL"] || OWNER_SUPABASE_URL;
  const anon = process.env["EXTERNAL_SUPABASE_ANON_KEY"] || OWNER_SUPABASE_PUBLISHABLE_KEY;
  const serviceRole = process.env["EXTERNAL_SUPABASE_SERVICE_ROLE_KEY"];

  process.env["SUPABASE_URL"] = url;
  const ref = url.replace(/^https?:\/\//, "").split(".")[0];
  if (ref) process.env["SUPABASE_PROJECT_ID"] = ref;
  process.env["SUPABASE_PUBLISHABLE_KEY"] = anon;
  if (serviceRole) process.env["SUPABASE_SERVICE_ROLE_KEY"] = serviceRole;
}

applyOwnerSupabaseEnv();

export const supabaseTarget = {
  url: process.env["SUPABASE_URL"],
  external: true,
};
