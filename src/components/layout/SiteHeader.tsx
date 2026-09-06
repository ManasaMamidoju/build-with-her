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
  { to: "/", label: "Home" },
  { to: "/services", label: "Ways to work with us" },
  { to: "/podcast", label: "Podcast" },
  { to: "/interviews", label: "Interviews" },
  { to: "/learn", label: "Learn" },
  { to: "/about", label: "About" },
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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-editorial flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <RoseMark className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Build With Her Media
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-sm text-primary" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin ? (
            <Button asChild size="sm">
              <Link to="/admin">Studio</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant={signedIn ? "outline" : "default"}>
              <Link to="/login">{signedIn ? "My account" : "Sign in"}</Link>
            </Button>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background md:hidden">
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
            {isAdmin ? (
              <Link to="/admin" onClick={() => setOpen(false)} className="py-3 text-base text-primary">
                Studio
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="py-3 text-base text-primary"
              >
                {signedIn ? "My account" : "Sign in"}
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
