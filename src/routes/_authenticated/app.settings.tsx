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
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const loadFn = useServerFn(getMySettings);
  const saveFn = useServerFn(saveMySettings);
  const deleteFn = useServerFn(deleteMyAccount);

  const { data } = useQuery({ queryKey: ["my-settings"], queryFn: () => loadFn({}) });

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentSms, setConsentSms] = useState(false);
  const [consentCommunity, setConsentCommunity] = useState(false);
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!data?.profile) return;
    setFullName(data.profile.full_name ?? "");
    setBusinessName(data.profile.business_name ?? "");
    setPhone(data.profile.phone ?? "");
    setIndustryId(data.profile.industry_id ?? "");
    setConsentEmail(data.profile.consent_email);
    setConsentSms(data.profile.consent_sms);
    setConsentCommunity(data.profile.consent_community);
    const next: Record<string, string> = {};
    for (const row of data.handles) next[row.platform] = row.handle;
    setHandles(next);
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await saveFn({
        data: {
          fullName,
          businessName,
          phone,
          industryId: industryId || null,
          consentEmail,
          consentSms,
          consentCommunity,
          handles: PLATFORMS.map((platform) => ({
            platform,
            handle: handles[platform] ?? "",
          })),
        },
      });
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  async function closeAccount() {
    try {
      await deleteFn({});
      await supabase.auth.signOut();
      toast.success("Your account is closed");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not close your account.");
    }
  }

  return (
    <main className="container-editorial max-w-2xl py-12 md:py-16">
      <h1 className="text-3xl">Your details</h1>
      <p className="mt-3 text-base text-muted-foreground">
        We use these to write to you properly and to know what your business does. Nothing here is
        shared with anyone outside our team.
      </p>

      <section className="mt-10 space-y-5">
        <div>
          <Label htmlFor="fullName">Your name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-2 h-12"
          />
        </div>
        <div>
          <Label htmlFor="email">Your email</Label>
          <Input id="email" value={data?.profile?.email ?? ""} readOnly className="mt-2 h-12" />
          <p className="mt-2 text-sm text-muted-foreground">
            This comes from the Google account you sign in with.
          </p>
        </div>
        <div>
          <Label htmlFor="businessName">Your business name</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className="mt-2 h-12"
          />
        </div>
        <div>
          <Label htmlFor="industry">What kind of business is it?</Label>
          <select
            id="industry"
            value={industryId}
            onChange={(event) => setIndustryId(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 text-base"
          >
            <option value="">Choose one</option>
            {(data?.industries ?? []).map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="phone">Your phone number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 h-12"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Where people can find you</h2>
        <div className="mt-5 space-y-4">
          {PLATFORMS.map((platform) => (
            <div key={platform}>
              <Label htmlFor={platform} className="capitalize">
                {platform}
              </Label>
              <Input
                id={platform}
                value={handles[platform] ?? ""}
                onChange={(event) =>
                  setHandles((prev) => ({ ...prev, [platform]: event.target.value }))
                }
                className="mt-2 h-12"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">What we may send you</h2>
        <div className="mt-5 space-y-4">
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentEmail}
              onCheckedChange={(value) => setConsentEmail(value === true)}
              className="mt-1"
            />
            <span>Email me my results, new tutorials and cohort dates.</span>
          </label>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentSms}
              onCheckedChange={(value) => setConsentSms(value === true)}
              className="mt-1"
            />
            <span>Text me reminders about sessions I have booked.</span>
          </label>
          <label className="flex items-start gap-3 text-base">
            <Checkbox
              checked={consentCommunity}
              onCheckedChange={(value) => setConsentCommunity(value === true)}
              className="mt-1"
            />
            <span>Invite me to the community of women building alongside me.</span>
          </label>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          You can change any of these here at any time, and every email has an unsubscribe link.
        </p>
      </section>

      <Button onClick={save} disabled={saving} size="lg" className="mt-10 h-12 px-7 text-base">
        {saving ? "Saving" : "Save my details"}
      </Button>

      <section className="mt-16 rounded-2xl border border-border p-6">
        <h2 className="text-xl">Close my account</h2>
        <p className="mt-2 text-base text-muted-foreground">
          This removes your account and your records from our system. It cannot be undone, and your
          score and sessions go with it.
        </p>
        {confirmDelete ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="destructive" onClick={closeAccount}>
              Yes, close my account
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep my account
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="mt-5" onClick={() => setConfirmDelete(true)}>
            Close my account
          </Button>
        )}
      </section>
    </main>
  );
}
