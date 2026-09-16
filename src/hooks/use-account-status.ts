import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { amIClient } from "@/lib/account.functions";

/** Whether the current visitor is signed in, and whether she is a client (vs. a lead). */
export function useAccountStatus() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSignedIn(Boolean(session));
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const checkClient = useServerFn(amIClient);
  const { data, isLoading } = useQuery({
    queryKey: ["me", "is-client"],
    queryFn: () => checkClient(),
    enabled: signedIn,
    staleTime: 5 * 60 * 1000,
  });

  return {
    signedIn,
    isClient: signedIn && data?.isClient === true,
    isLoading: signedIn && isLoading,
  };
}
