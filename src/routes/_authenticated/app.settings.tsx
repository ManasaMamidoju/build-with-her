import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount, getMySettings, saveMySettings } from "@/lib/member.functions";

const PLATFORMS = ["instagram", "tiktok", "facebook", "linkedin", "website"] as const;

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: "Your details | Build With Her Media" },
      { name: "description", content: "Your name, business, handles and what we may send you." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Settings;
});

function Settings() {
  return null;
}
