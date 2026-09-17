import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RoseMark } from "@/components/brand/RoseMark";
import { amIAdmin } from "@/lib/admin.functions";

const links = [
  { to: "/score", label: "Score" },
  { to: "/services", label: "Services" },
  { to: "/podcast", label: "Podcast" },
  { to: "/learn", label: "Learn" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/community", label: "Community" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
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

  const checkAdmin = useServerFn(amIAdmin);
  const { data: adminCheck } = useQuery({
    queryKey: ["me", "is-admin"],
    queryFn: () => checkAdmin(),
    enabled: signedIn,
    staleTime: 5 * 60 * 1000,
  });
  const isAdmin = signedIn && adminCheck?.isAdmin === true;

  const accountLabel = isAdmin ? "Studio" : signedIn ? "My account" : "Sign in";
  const accountTo = isAdmin ? "/admin" : signedIn ? "/app" : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-editorial flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <RoseMark className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Build With Her Media
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-sm text-primary" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            to={accountTo}
            className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {accountLabel}
          </Link>
          <Button asChild size="sm" className="h-10 px-5">
            <Link to="/score">Get your Findability Score</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background lg:hidden">
          <div className="container-editorial flex flex-col py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={accountTo}
              onClick={() => setOpen(false)}
              className="py-3 text-base text-primary"
            >
              {accountLabel}
            </Link>
            <Button asChild size="lg" className="mt-2 h-12 w-full text-base">
              <Link to="/score" onClick={() => setOpen(false)}>
                Get your Findability Score
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
