import { Link } from "@tanstack/react-router";

import { RoseMark } from "@/components/brand/RoseMark";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="container-editorial grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <RoseMark className="h-7 w-7 text-primary" />
            <span className="font-display text-lg font-semibold">Build With Her Media</span>
          </div>
          <p className="mt-4 max-w-sm text-base text-muted-foreground">
            Media, systems and AI for women who own businesses. {SITE.tagline}
          </p>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">Pages</p>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <Link to="/" className="text-foreground hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-foreground hover:text-primary">
                Ways to work with us
              </Link>
            </li>
            <li>
              <Link to="/score/quiz" className="text-foreground hover:text-primary">
                Take the quiz
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-foreground hover:text-primary">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">The details</p>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <Link to="/terms" className="text-foreground hover:text-primary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-foreground hover:text-primary">
                Privacy Notice
              </Link>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="text-foreground hover:text-primary">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-editorial py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE.legalName}. Built by women, for women.
        </div>
      </div>
    </footer>
  );
}
