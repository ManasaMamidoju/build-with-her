import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Pricing on the public site is shown only once she is a client (her first
 * paid booking, build, podcast slot or workshop). Everyone else, including a
 * signed-in lead who has only taken the score, sees "shared on your call"
 * instead.
 */
export const amIClient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "client",
    });
    return { isClient: data === true };
  });
