import { createMiddleware } from "@tanstack/react-start";

// Cloudflare injects secrets per request, so module-scope env reads can miss them.
// Re-point the Supabase server variables at the owner's project on every request
// before any handler builds a Supabase client.
export const supabaseTargetMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { applyOwnerSupabaseEnv } = await import("./supabase-target.server");
    applyOwnerSupabaseEnv();
    return next();
  },
);

export const supabaseTargetRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const { applyOwnerSupabaseEnv } = await import("./supabase-target.server");
    applyOwnerSupabaseEnv();
    return next();
  },
);
