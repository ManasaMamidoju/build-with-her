import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoseMark } from "@/components/brand/RoseMark";
import { takePostLoginRedirect } from "@/lib/post-login-redirect";
import { canonical } from "@/lib/site";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to Build With Her Media" },
      {
        name: "description",
        content:
          "Sign in with Google or email to see your Findability Score, your bookings and your projects.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sign in to Build With Her Media" },
      {
        property: "og:description",
        content: "Sign in with Google or email to see your score, bookings and projects.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/login") }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setSignedIn(true);
        window.location.href = takePostLoginRedirect() ?? "/";
      }
      if (event === "SIGNED_OUT") setSignedIn(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setBusy(true);
    // Sign-in runs against the owner's own Supabase project, so use its Google
    // provider directly rather than the Lovable broker (which targets the built-in project).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setBusy(false);
      toast.error("That sign in did not go through. Try once more.");
      return;
    }
  };

  const signInWithEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setEmailBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setEmailBusy(false);
      toast.error("That email and password did not match. Try again.");
      return;
    }
    window.location.href = takePostLoginRedirect() ?? "/";
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("You are signed out.");
  };

  return (
    <main className="container-editorial flex min-h-[70vh] flex-col items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <RoseMark className="h-10 w-10 text-primary" />
        <h1 className="mt-5 text-3xl">Welcome back</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Your account holds your Findability Score, your bookings and every deliverable we build
          for you.
        </p>

        {signedIn ? (
          <div className="mt-8 space-y-3">
            <p className="text-sm text-foreground">You are signed in.</p>
            <Button asChild className="w-full">
              <Link to="/">Go to the home page</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <Button className="w-full" onClick={signIn} disabled={busy || emailBusy}>
              {busy ? "Opening Google" : "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or with email
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={signInWithEmail}>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@yourbusiness.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={emailBusy || busy}
              >
                {emailBusy ? "Signing in" : "Sign in with email"}
              </Button>
            </form>
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="text-primary underline">
            terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary underline">
            privacy notice
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
