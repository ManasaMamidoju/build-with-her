import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Simple spam guard for public forms. Counts recent touchpoints of the same
 * kind for the same email, so a bot filling a form over and over is stopped
 * without troubling a real woman who sends one message.
 */
export async function assertNotFlooding(options: {
  email: string;
  kind: string;
  maxInWindow?: number;
  windowMinutes?: number;
  message?: string;
}) {
  const maxInWindow = options.maxInWindow ?? 3;
  const windowMinutes = options.windowMinutes ?? 60;
  const since = new Date(Date.now() - windowMinutes * 60000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("touchpoints")
    .select("id", { count: "exact", head: true })
    .eq("kind", options.kind)
    .ilike("email", options.email)
    .gte("created_at", since);

  if (error) return; // never block a real woman because a count failed

  if ((count ?? 0) >= maxInWindow) {
    throw new Error(
      options.message ??
        "We already have that from you. Give us a little while to come back to you.",
    );
  }
}
