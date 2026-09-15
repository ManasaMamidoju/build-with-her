// The app runs on the owner's own Supabase project.
// The platform rewrites .env with the built-in project's values, so re-point the
// server-side Supabase variables at the owner's project on every worker start.
// Imported from src/server.ts (the SSR entry) before any Supabase client is built.
const url = process.env['EXTERNAL_SUPABASE_URL'];
const anon = process.env['EXTERNAL_SUPABASE_ANON_KEY'];
const serviceRole = process.env['EXTERNAL_SUPABASE_SERVICE_ROLE_KEY'];

if (url) {
  process.env['SUPABASE_URL'] = url;
  const ref = url.replace(/^https?:\/\//, "").split(".")[0];
  if (ref) process.env['SUPABASE_PROJECT_ID'] = ref;
}
if (anon) process.env['SUPABASE_PUBLISHABLE_KEY'] = anon;
if (serviceRole) process.env['SUPABASE_SERVICE_ROLE_KEY'] = serviceRole;

export const supabaseTarget = {
  url: process.env['SUPABASE_URL'],
  external: Boolean(url),
};
