import type { ReactNode } from "react";

import { SITE } from "@/lib/site";

export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

export function LegalLayout({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string;
  lastUpdated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="container-editorial py-14 md:py-24">
      <p className="eyebrow text-primary">Draft, review before launch</p>
      <h1 className="mt-3">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated {lastUpdated}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow text-muted-foreground">On this page</p>
            <ul className="mt-4 space-y-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-muted-foreground hover:text-primary">
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="prose-editorial max-w-[68ch] space-y-8 text-base text-foreground">
          <p className="text-lg text-muted-foreground">
            {SITE.legalName} operates this site. {intro}
          </p>
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl">{section.heading}</h2>
              <div className="mt-3 space-y-3">{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
