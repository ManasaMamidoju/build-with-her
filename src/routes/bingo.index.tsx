import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AREA_ORDER } from "@/lib/score-rubric";
import { BINGO_GRID, CONSENT_COPY, bingoLines, isChecked, type BingoSquare } from "@/lib/bingo";
import { submitBingo } from "@/lib/bingo.functions";
import { getCapturedSource } from "@/lib/source-capture";
import { rememberScoreToken } from "@/lib/score-memory";
import { canonical, SITE } from "@/lib/site";

const STORAGE_KEY = "bwhm.bingo.v1";

export const Route = createFileRoute("/bingo/")({
  head: () => ({
    meta: [
      { title: "Findability Bingo | Build With Her Media" },
      {
        name: "description",
        content:
          "Tick every square your business already does and get your Findability Score, your character and your next steps to rank on Google and AI search.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Findability Bingo" },
      {
        property: "og:description",
        content: "25 squares. One score. Your next steps to get found on Google and AI search.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/bingo") }],
  }),
  component: BingoPage,
});

const SCALE_LETTERS: Record<string, string> = {
  source: "S",
  clarity: "C",
  attract: "A",
  land: "L",
  elevate: "E",
};

type Details = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  website: string;
  handles: { instagram: string; tiktok: string; facebook: string; other: string };
  consentEmail: boolean;
  consentSms: boolean;
  consentTerms: boolean;
};

const emptyDetails: Details = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  website: "",
  handles: { instagram: "", tiktok: "", facebook: "", other: "" },
  // Marketing consent must be an active choice, so both start unticked.
  consentEmail: false,
  consentSms: false,
  consentTerms: false,
};

type Saved = {
  checked: Record<string, boolean>;
  mysteryText: Record<string, string>;
  details: Omit<Details, "consentEmail" | "consentSms" | "consentTerms">;
};

function BingoPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitBingo);
  const [step, setStep] = useState<"card" | "details">("card");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mysteryText, setMysteryText] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Her card survives a locked phone or a closed tab mid-presentation.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Saved>;
        if (saved.checked) setChecked(saved.checked);
        if (saved.mysteryText) setMysteryText(saved.mysteryText);
        if (saved.details) setDetails((d) => ({ ...d, ...saved.details }));
      }
    } catch {
      // nothing saved, start fresh
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const { consentEmail: _e, consentSms: _s, consentTerms: _t, ...rest } = details;
      const saved: Saved = { checked, mysteryText, details: rest };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // storage blocked, the card just lives in memory
    }
  }, [checked, mysteryText, details, loaded]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const { count: bingos, onLine } = useMemo(() => bingoLines(checked), [checked]);
  const tickedCount = BINGO_GRID.flat().filter((s) => s.kind !== "free" && checked[s.id]).length;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const before = bingoLines(prev).count;
      const after = bingoLines(next).count;
      if (after > before) toast.success(after === 1 ? "BINGO!" : `BINGO x${after}!`);
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const captured = getCapturedSource();
      const { token } = await submit({
        data: {
          checked,
          mysteryText,
          details: { ...details, consentTerms: true, source: captured?.src ?? "" },
        },
      });
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // nothing to clear
      }
      rememberScoreToken(token);
      navigate({ to: "/bingo/r/$token", params: { token } });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "We could not save your score. Please check your email and try again.",
      );
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 md:pt-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">SEO to Sale workshop</p>
          <h1 className="mt-2 text-4xl leading-none sm:text-5xl">Findability Bingo</h1>
        </div>
        <p className="shrink-0 text-right font-display text-lg font-semibold leading-tight text-primary">
          Build
          <br />
          With Her
          <br />
          Media
        </p>
      </header>

      {step === "card" ? (
        <>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Tap every square your business already does. Listen for the three mystery squares and
            write them in when they are revealed. Anything left blank becomes your to-do list.
          </p>

          <div className="sticky top-0 z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{tickedCount}</span> of 24 ticked
              {bingos > 0 ? (
                <span className="ml-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {bingos === 1 ? "BINGO" : `${bingos} BINGOS`}
                </span>
              ) : null}
            </p>
            <Button onClick={() => setStep("details")} className="h-10">
              Get my score <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>

          {/* Phone: one SCALE column at a time, stacked. */}
          <div className="mt-6 space-y-8 md:hidden">
            {AREA_ORDER.map((area, col) => (
              <section key={area}>
                <ColumnHeading area={area} />
                <div className="mt-3 grid grid-cols-1 gap-2.5">
                  {BINGO_GRID.map((row) => row[col]!).map((square) => (
                    <SquareTile
                      key={square.id}
                      square={square}
                      checked={isChecked(checked, square)}
                      onLine={onLine.has(square.id)}
                      text={mysteryText[square.id] ?? ""}
                      onToggle={() => toggle(square.id)}
                      onText={(v) => setMysteryText((m) => ({ ...m, [square.id]: v }))}
                      layout="row"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Tablet and up: the card as printed. */}
          <div className="mt-6 hidden md:block">
            <div className="grid grid-cols-5 gap-3">
              {AREA_ORDER.map((area) => (
                <ColumnHeading key={area} area={area} centered />
              ))}
              {BINGO_GRID.flat().map((square) => (
                <SquareTile
                  key={square.id}
                  square={square}
                  checked={isChecked(checked, square)}
                  onLine={onLine.has(square.id)}
                  text={mysteryText[square.id] ?? ""}
                  onToggle={() => toggle(square.id)}
                  onText={(v) => setMysteryText((m) => ({ ...m, [square.id]: v }))}
                  layout="tile"
                />
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-blush p-6">
            <h2 className="text-2xl text-crimson-dark">Done ticking?</h2>
            <p className="mt-2 text-base text-crimson-dark/90">
              Tell us where you show up online and we will turn this card into your Findability
              Score, your character and your next steps.
            </p>
            <Button
              onClick={() => setStep("details")}
              size="lg"
              className="mt-5 h-12 px-7 text-base"
            >
              Get my score <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl">
          <h2 className="text-3xl">Where should your score go?</h2>
          <p className="mt-2 text-base text-muted-foreground">
            We look at your website and profiles to check your card. Your score shows on the next
            screen and we email you a copy.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field
              id="fullName"
              label="Your name"
              required
              value={details.fullName}
              autoComplete="name"
              onChange={(v) => setDetails({ ...details, fullName: v })}
            />
            <Field
              id="businessName"
              label="Business name"
              required
              value={details.businessName}
              autoComplete="organization"
              onChange={(v) => setDetails({ ...details, businessName: v })}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              required
              value={details.email}
              autoComplete="email"
              onChange={(v) => setDetails({ ...details, email: v })}
            />
            <Field
              id="phone"
              label="Phone (optional)"
              type="tel"
              value={details.phone}
              autoComplete="tel"
              onChange={(v) =>
                setDetails({ ...details, phone: v, consentSms: v ? details.consentSms : false })
              }
            />
            <div className="sm:col-span-2">
              <Field
                id="website"
                label="Website (optional)"
                placeholder="yourbusiness.com"
                value={details.website}
                inputMode="url"
                onChange={(v) => setDetails({ ...details, website: v })}
              />
            </div>
          </div>

          <fieldset className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <legend className="px-2 text-lg font-medium">Your social pages</legend>
            <p className="text-sm text-muted-foreground">Skip any you do not use.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                id="instagram"
                label="Instagram"
                placeholder="@yourbusiness"
                value={details.handles.instagram}
                onChange={(v) =>
                  setDetails({ ...details, handles: { ...details.handles, instagram: v } })
                }
              />
              <Field
                id="tiktok"
                label="TikTok"
                placeholder="@yourbusiness"
                value={details.handles.tiktok}
                onChange={(v) =>
                  setDetails({ ...details, handles: { ...details.handles, tiktok: v } })
                }
              />
              <Field
                id="facebook"
                label="Facebook"
                placeholder="facebook.com/yourbusiness"
                value={details.handles.facebook}
                onChange={(v) =>
                  setDetails({ ...details, handles: { ...details.handles, facebook: v } })
                }
              />
              <Field
                id="other"
                label="Anywhere else"
                placeholder="Yelp, YouTube, Google listing link"
                value={details.handles.other}
                onChange={(v) =>
                  setDetails({ ...details, handles: { ...details.handles, other: v } })
                }
              />
            </div>
          </fieldset>

          <fieldset className="mt-8 rounded-2xl bg-secondary p-5 sm:p-6">
            <legend className="px-2 text-lg font-medium">Your permission</legend>
            <div className="mt-2 space-y-4">
              <ConsentRow
                checked={details.consentEmail}
                onChange={(v) => setDetails({ ...details, consentEmail: v })}
              >
                {CONSENT_COPY.email}
              </ConsentRow>
              <ConsentRow
                checked={details.consentSms}
                disabled={!details.phone}
                onChange={(v) => setDetails({ ...details, consentSms: v })}
              >
                {CONSENT_COPY.sms}
                {!details.phone ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Add a phone number above to choose this.
                  </span>
                ) : null}
              </ConsentRow>
              <ConsentRow
                checked={details.consentTerms}
                onChange={(v) => setDetails({ ...details, consentTerms: v })}
              >
                I agree to the{" "}
                <Link to="/terms" target="_blank" className="underline">
                  Terms
                </Link>{" "}
                and the{" "}
                <Link to="/privacy" target="_blank" className="underline">
                  Privacy Notice
                </Link>
                . <span className="text-muted-foreground">(Required)</span>
              </ConsentRow>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Email and text permission are optional and you will still get your score without them.
              We never sell your details. Questions: {SITE.email}.
            </p>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              className="h-12 px-7 text-base"
              disabled={saving || !details.consentTerms}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scoring your card
                </>
              ) : (
                "Show me my score"
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep("card")} disabled={saving}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to my card
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}

function ColumnHeading({
  area,
  centered,
}: {
  area: (typeof AREA_ORDER)[number];
  centered?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline gap-2", centered && "flex-col items-center gap-0")}>
      <span className="font-display text-4xl font-bold leading-none text-primary">
        {SCALE_LETTERS[area]}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
        {area}
      </span>
    </div>
  );
}

function SquareTile({
  square,
  checked,
  onLine,
  text,
  onToggle,
  onText,
  layout,
}: {
  square: BingoSquare;
  checked: boolean;
  onLine: boolean;
  text: string;
  onToggle: () => void;
  onText: (value: string) => void;
  layout: "row" | "tile";
}) {
  if (square.kind === "free") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground",
          layout === "tile" && "min-h-32 flex-col justify-center text-center",
        )}
      >
        <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-display text-2xl font-bold leading-none">{square.label}</p>
          <p className="mt-1 text-sm">{square.sublabel}</p>
        </div>
      </div>
    );
  }

  if (square.kind === "mystery") {
    const id = `mystery-${square.number}`;
    return (
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed border-primary/60 bg-blush p-4 transition",
          checked && "border-solid border-primary",
          onLine && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          layout === "tile" && "min-h-32",
        )}
      >
        <label className="flex items-center gap-2.5">
          <Checkbox
            checked={checked}
            onCheckedChange={onToggle}
            aria-label={`Mystery #${square.number}`}
          />
          <span className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-primary">
            <HelpCircle className="h-4 w-4" aria-hidden="true" /> Mystery #{square.number}
          </span>
        </label>
        <Label htmlFor={id} className="sr-only">
          Write mystery square #{square.number}
        </Label>
        <Textarea
          id={id}
          value={text}
          maxLength={200}
          rows={2}
          placeholder="Write it in here"
          onChange={(e) => onText(e.target.value)}
          className="mt-2.5 min-h-14 resize-none bg-background text-sm"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border-2 border-foreground/80 bg-card p-4 text-left text-sm leading-snug transition active:scale-[0.98]",
        checked && "border-primary bg-primary/10",
        onLine && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        layout === "tile" && "min-h-32 flex-col items-start",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-foreground/80",
          checked && "border-primary bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <span className={cn(layout === "tile" && "w-full text-center")}>{square.label}</span>
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        required={required}
        maxLength={type === "email" ? 255 : 160}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-12"
      />
    </div>
  );
}

function ConsentRow({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn("flex items-start gap-3 text-sm leading-relaxed", disabled && "opacity-60")}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <span>{children}</span>
    </label>
  );
}
