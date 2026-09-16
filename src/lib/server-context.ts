import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type AuthedContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};
