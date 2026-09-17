import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostForTeam,
  listBlogPostsForTeam,
  updateBlogPost,
} from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({
    meta: [
      { title: "Blog | Build With Her Media studio" },
      { name: "description", content: "Write, edit and publish blog posts." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBlog,
});

const CTA_OPTIONS = [
  { value: "/score/quiz", label: "Take the Findability Score" },
  { value: "/services", label: "See our services" },
  { value: "/podcast", label: "Book a podcast interview" },
] as const;

type BlogRow = Awaited<ReturnType<typeof getBlogPostForTeam>>;

type FormState = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: string;
  tags: string;
  intro: string;
  sections: { heading: string; body: string }[];
  takeaways: string;
  ctaLabel: string;
  ctaTo: (typeof CTA_OPTIONS)[number]["value"];
  status: "draft" | "published";
  interviewGuestName: string;
  interviewBusinessName: string;
  interviewInstagramUrl: string;
  interviewBusinessWebsite: string;
  interviewBacklinkLabel: string;
};

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    description: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    readMinutes: "5",
    tags: "",
    intro: "",
    sections: [{ heading: "", body: "" }],
    takeaways: "",
    ctaLabel: "Take the Findability Score",
    ctaTo: "/score/quiz",
    status: "published",
    interviewGuestName: "",
    interviewBusinessName: "",
    interviewInstagramUrl: "",
    interviewBusinessWebsite: "",
    interviewBacklinkLabel: "",
  };
}

function rowToForm(row: NonNullable<BlogRow>): FormState {
  const sections = row.sections as { heading: string; body: string[] }[];
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.published_at,
    readMinutes: String(row.read_minutes),
    tags: row.tags.join(", "),
    intro: row.intro,
    sections: sections.map((section) => ({
      heading: section.heading,
      body: section.body.join("\n\n"),
    })),
    takeaways: row.takeaways.join("\n"),
    ctaLabel: row.cta_label,
    ctaTo: row.cta_to as FormState["ctaTo"],
    status: row.status as FormState["status"],
    interviewGuestName: row.interview_guest_name ?? "",
    interviewBusinessName: row.interview_business_name ?? "",
    interviewInstagramUrl: row.interview_instagram_url ?? "",
    interviewBusinessWebsite: row.interview_business_website ?? "",
    interviewBacklinkLabel: row.interview_backlink_label ?? "",
  };
}

function AdminBlog() {
  const listFn = useServerFn(listBlogPostsForTeam);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "blog-posts"],
    queryFn: () => listFn(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const rows = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Blog</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Write and edit posts, and add social or website links to any post, including guest
            interviews, without a code change.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setCreating(true);
          }}
        >
          New post
        </Button>
      </div>

      {creating ? (
        <BlogPostForm
          initial={emptyForm()}
          onCancel={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refetch();
          }}
        />
      ) : null}

      {editingId ? (
        <EditBlogPost
          id={editingId}
          onCancel={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null);
            refetch();
          }}
          onDeleted={() => {
            setEditingId(null);
            refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-base text-muted-foreground">Loading your posts.</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-border p-6 text-base text-muted-foreground">
          No posts yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-blush text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Slug</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Published</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">{row.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.status}</td>
                  <td className="numeric px-4 py-3 text-muted-foreground">{row.published_at}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.interview_guest_name ? "Interview" : "Opinion"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCreating(false);
                        setEditingId(row.id);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EditBlogPost({
  id,
  onCancel,
  onSaved,
  onDeleted,
}: {
  id: string;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const getFn = useServerFn(getBlogPostForTeam);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blog-post", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading || !data) {
    return <p className="mt-8 text-base text-muted-foreground">Loading that post.</p>;
  }

  return (
    <BlogPostForm
      id={id}
      initial={rowToForm(data)}
      onCancel={onCancel}
      onSaved={onSaved}
      onDeleted={onDeleted}
    />
  );
}

function BlogPostForm({
  id,
  initial,
  onCancel,
  onSaved,
  onDeleted,
}: {
  id?: string;
  initial: FormState;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const createFn = useServerFn(createBlogPost);
  const updateFn = useServerFn(updateBlogPost);
  const deleteFn = useServerFn(deleteBlogPost);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(initial), [initial]);

  function updateSection(index: number, patch: Partial<{ heading: string; body: string }>) {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addSection() {
    setForm((f) => ({ ...f, sections: [...f.sections, { heading: "", body: "" }] }));
  }

  function removeSection(index: number) {
    setForm((f) => ({ ...f, sections: f.sections.filter((_, i) => i !== index) }));
  }

  async function submit() {
    const readMinutes = Number(form.readMinutes);
    if (!form.title.trim() || !form.slug.trim() || !form.description.trim()) {
      toast.error("Title, slug and description are required.");
      return;
    }
    if (!Number.isInteger(readMinutes) || readMinutes < 1) {
      toast.error("Read minutes must be a whole number.");
      return;
    }

    const payload = {
      slug: form.slug.trim().toLowerCase(),
      title: form.title.trim(),
      description: form.description.trim(),
      publishedAt: form.publishedAt,
      readMinutes,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      intro: form.intro.trim(),
      sections: form.sections
        .filter((s) => s.heading.trim() && s.body.trim())
        .map((s) => ({
          heading: s.heading.trim(),
          body: s.body
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean),
        })),
      takeaways: form.takeaways
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      ctaLabel: form.ctaLabel.trim(),
      ctaTo: form.ctaTo,
      status: form.status,
      interviewGuestName: form.interviewGuestName.trim(),
      interviewBusinessName: form.interviewBusinessName.trim(),
      interviewInstagramUrl: form.interviewInstagramUrl.trim(),
      interviewBusinessWebsite: form.interviewBusinessWebsite.trim(),
      interviewBacklinkLabel: form.interviewBacklinkLabel.trim(),
    };

    if (payload.sections.length === 0) {
      toast.error("Add at least one section with a heading and body.");
      return;
    }

    setSaving(true);
    try {
      if (id) {
        await updateFn({ data: { ...payload, id } });
      } else {
        await createFn({ data: payload });
      }
      toast.success("Post saved");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that post.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!id || !onDeleted) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setSaving(true);
    try {
      await deleteFn({ data: { id } });
      toast.success("Post deleted");
      onDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not delete that post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-6 rounded-2xl border border-border bg-blush p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            className="mt-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (the URL, lowercase-with-hyphens)</Label>
          <Input
            id="slug"
            className="mt-2"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="publishedAt">Published date</Label>
          <Input
            id="publishedAt"
            type="date"
            className="mt-2"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description (for search results and previews)</Label>
          <Textarea
            id="description"
            rows={2}
            className="mt-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="readMinutes">Read minutes</Label>
          <Input
            id="readMinutes"
            type="number"
            min={1}
            className="mt-2"
            value={form.readMinutes}
            onChange={(e) => setForm({ ...form, readMinutes: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            className="mt-2"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="intro">Intro paragraph</Label>
          <Textarea
            id="intro"
            rows={3}
            className="mt-2"
            value={form.intro}
            onChange={(e) => setForm({ ...form, intro: e.target.value })}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Sections</Label>
          <Button type="button" size="sm" variant="outline" onClick={addSection}>
            Add a section
          </Button>
        </div>
        <div className="mt-3 space-y-4">
          {form.sections.map((section, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <Input
                  placeholder="Section heading"
                  value={section.heading}
                  onChange={(e) => updateSection(index, { heading: e.target.value })}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSection(index)}
                >
                  Remove
                </Button>
              </div>
              <Textarea
                className="mt-3"
                rows={4}
                placeholder="Paragraphs, separated by a blank line"
                value={section.body}
                onChange={(e) => updateSection(index, { body: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="takeaways">In practice (one per line)</Label>
        <Textarea
          id="takeaways"
          rows={3}
          className="mt-2"
          value={form.takeaways}
          onChange={(e) => setForm({ ...form, takeaways: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="ctaLabel">Button text</Label>
          <Input
            id="ctaLabel"
            className="mt-2"
            value={form.ctaLabel}
            onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ctaTo">Button goes to</Label>
          <select
            id="ctaTo"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.ctaTo}
            onChange={(e) => setForm({ ...form, ctaTo: e.target.value as FormState["ctaTo"] })}
          >
            {CTA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
          >
            <option value="draft">Draft (hidden from the site)</option>
            <option value="published">Published (live on the site)</option>
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm font-medium">Guest interview links (optional)</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill these in for a guest interview post: the Instagram reel embeds on the post, and the
          backlink card links out to her site or handle.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="interviewGuestName">Guest name</Label>
            <Input
              id="interviewGuestName"
              className="mt-2"
              value={form.interviewGuestName}
              onChange={(e) => setForm({ ...form, interviewGuestName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="interviewBusinessName">Her business / title</Label>
            <Input
              id="interviewBusinessName"
              className="mt-2"
              value={form.interviewBusinessName}
              onChange={(e) => setForm({ ...form, interviewBusinessName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="interviewInstagramUrl">Instagram post/reel URL</Label>
            <Input
              id="interviewInstagramUrl"
              className="mt-2"
              placeholder="https://www.instagram.com/p/..."
              value={form.interviewInstagramUrl}
              onChange={(e) => setForm({ ...form, interviewInstagramUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="interviewBusinessWebsite">Her website (optional)</Label>
            <Input
              id="interviewBusinessWebsite"
              className="mt-2"
              placeholder="https://..."
              value={form.interviewBusinessWebsite}
              onChange={(e) => setForm({ ...form, interviewBusinessWebsite: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="interviewBacklinkLabel">Backlink button text (optional)</Label>
            <Input
              id="interviewBacklinkLabel"
              className="mt-2"
              placeholder="Follow Jane Doe"
              value={form.interviewBacklinkLabel}
              onChange={(e) => setForm({ ...form, interviewBacklinkLabel: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving" : "Save this post"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        {id && onDeleted ? (
          <Button variant="ghost" className="text-destructive" onClick={remove} disabled={saving}>
            Delete this post
          </Button>
        ) : null}
      </div>
    </div>
  );
}
