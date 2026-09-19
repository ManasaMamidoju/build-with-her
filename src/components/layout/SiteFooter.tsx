import { Link } from "@tanstack/react-router";

import {
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/site/SocialIcons";
import { DIGIMAIDS_URL, SITE, SOCIAL } from "@/lib/site";

const socialLinks = [
  { href: SOCIAL.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: SOCIAL.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: SOCIAL.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: SOCIAL.tiktok, label: "TikTok", Icon: TiktokIcon },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="container-editorial grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src="/brand/logo.png" alt="" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold">Build With Her Media</span>
          </div>
          <p className="mt-4 max-w-xs text-base text-muted-foreground">{SITE.tagline}</p>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">Start</p>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <Link to="/score" className="text-foreground hover:text-primary">
                Findability Score
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-foreground hover:text-primary">
                Services
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-foreground hover:text-primary">
                Book a call
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">Watch and read</p>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <Link to="/podcast" className="text-foreground hover:text-primary">
                Podcast
              </Link>
            </li>
            <li>
              <Link to="/learn" className="text-foreground hover:text-primary">
                Learn
              </Link>
            </li>
            <li>
              <Link to="/events" className="text-foreground hover:text-primary">
                Events
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">Company</p>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <Link to="/about" className="text-foreground hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link to="/community" className="text-foreground hover:text-primary">
                Community
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-foreground hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-foreground hover:text-primary">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-foreground hover:text-primary">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-editorial flex flex-col gap-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            {SITE.legalName}, {SITE.city}
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <div className="container-editorial pb-6 text-sm text-muted-foreground">
          Want the automations without the media?{" "}
          <a
            href={DIGIMAIDS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Visit DigiMAIDS.
          </a>
        </div>
      </div>
    </footer>
  );
}
