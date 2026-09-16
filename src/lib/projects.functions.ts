import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { STAGE_TEMPLATES, type ProjectType } from "@/lib/project-templates";
import type { AuthedContext } from "@/lib/server-context";
import type { Database } from "@/integrations/supabase/types";

async function hasAnyRole(context: AuthedContext, roles: readonly string[]) {
  for (const role of roles) {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (data === true) return true;
  }
  return false;
}

async function assertTeam(context: AuthedContext) {
  if (!(await hasAnyRole(context, ["admin", "content_manager"]))) throw new Error("Forbidden");
}

/* ------------------------------- team side ------------------------------- */

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        type: z.string().trim().max(40).optional().default(""),
        status: z.string().trim().max(40).optional().default(""),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("projects")
      .select("id, name, type, status, stage, due_at, created_at, profile_id")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.type) query = query.eq("type", data.type);
    if (data.status) query = query.eq("status", data.status);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const projects = rows ?? [];

    const ids = [...new Set(projects.map((row) => row.profile_id).filter(Boolean))] as string[];
    const people = new Map<string, { full_name: string | null; business_name: string | null }>();
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, business_name")
        .in("id", ids);
      for (const profile of profiles ?? []) {
        people.set(profile.id, {
          full_name: profile.full_name,
          business_name: profile.business_name,
        });
      }
    }

    return projects.map((project) => ({
      ...project,
      person: project.profile_id ? (people.get(project.profile_id) ?? null) : null,
    }));
  });

export const getProjectForTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!project) return null;

    const [stages, deliverables, person, editors] = await Promise.all([
      supabaseAdmin
        .from("project_stages")
        .select("id, name, sort_order, status, completed_at")
        .eq("project_id", data.id)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("deliverables")
        .select("*")
        .eq("project_id", data.id)
        .order("created_at", { ascending: true }),
      project.profile_id
        ? supabaseAdmin
            .from("profiles")
            .select("id, full_name, business_name, email")
            .eq("id", project.profile_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin.from("user_roles").select("user_id").eq("role", "editor"),
    ]);

    const editorIds = (editors.data ?? []).map((row) => row.user_id);
    let editorPeople: { id: string; full_name: string | null; email: string | null }[] = [];
    if (editorIds.length > 0) {
      const { data: rows } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", editorIds);
      editorPeople = rows ?? [];
    }

    return {
      project,
      stages: stages.data ?? [],
      deliverables: deliverables.data ?? [],
      person: person.data ?? null,
      editors: editorPeople,
    };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(1).max(160),
        type: z.enum(["podcast", "build", "consult", "bootcamp", "event_media", "custom"]),
        profileId: z.string().uuid().optional().or(z.literal("")),
        dueAt: z.string().trim().max(40).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const template = STAGE_TEMPLATES[data.type as ProjectType];

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .insert({
        name: data.name,
        type: data.type,
        profile_id: data.profileId || null,
        due_at: data.dueAt ? new Date(data.dueAt).toISOString() : null,
        stage: template[0] ?? null,
        owner_id: context.userId,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !project) throw new Error("We could not create that project.");

    await supabaseAdmin.from("project_stages").insert(
      template.map((name, index) => ({
        project_id: project.id,
        name,
        sort_order: index,
        status: index === 0 ? "doing" : "todo",
      })),
    );

    return { id: project.id as string };
  });

export const setStageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        stageId: z.string().uuid(),
        status: z.enum(["todo", "doing", "done"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: stage } = await supabaseAdmin
      .from("project_stages")
      .select("project_id, name")
      .eq("id", data.stageId)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("project_stages")
      .update({
        status: data.status,
        completed_at: data.status === "done" ? new Date().toISOString() : null,
      })
      .eq("id", data.stageId);
    if (error) throw new Error("We could not update that step.");

    if (stage && data.status === "doing") {
      await supabaseAdmin.from("projects").update({ stage: stage.name }).eq("id", stage.project_id);
    }
    return { ok: true as const };
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.string().trim().max(40).optional(),
        notes: z.string().trim().max(4000).nullable().optional(),
        dueAt: z.string().trim().max(40).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Database["public"]["Tables"]["projects"]["Update"] = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.dueAt !== undefined) {
      patch.due_at = data.dueAt ? new Date(data.dueAt).toISOString() : null;
    }
    const { error } = await supabaseAdmin.from("projects").update(patch).eq("id", data.id);
    if (error) throw new Error("We could not save that.");
    return { ok: true as const };
  });

const deliverableSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  title: z.string().trim().max(200).optional(),
  kind: z.string().trim().max(40).optional(),
  stage: z.string().trim().max(40).optional(),
  rawUrl: z.string().trim().max(600).nullable().optional(),
  editedUrl: z.string().trim().max(600).nullable().optional(),
  finalUrl: z.string().trim().max(600).nullable().optional(),
  publishedUrl: z.string().trim().max(600).nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional().or(z.literal("")),
  editorDueAt: z.string().trim().max(40).nullable().optional(),
  cmApproved: z.boolean().optional(),
  adminApproved: z.boolean().optional(),
  approvedForPosting: z.boolean().optional(),
  teamNotes: z.string().trim().max(4000).nullable().optional(),
  internalNotes: z.string().trim().max(4000).nullable().optional(),
});

export const saveDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => deliverableSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertTeam(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: Database["public"]["Tables"]["deliverables"]["Update"] = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.kind !== undefined) patch.kind = data.kind;
    if (data.stage !== undefined) patch.stage = data.stage;
    if (data.rawUrl !== undefined) patch.raw_url = data.rawUrl || null;
    if (data.editedUrl !== undefined) patch.edited_url = data.editedUrl || null;
    if (data.finalUrl !== undefined) patch.final_url = data.finalUrl || null;
    if (data.publishedUrl !== undefined) patch.published_url = data.publishedUrl || null;
    if (data.assignedTo !== undefined) patch.assigned_to = data.assignedTo || null;
    if (data.editorDueAt !== undefined) {
      patch.editor_due_at = data.editorDueAt ? new Date(data.editorDueAt).toISOString() : null;
    }
    if (data.cmApproved !== undefined) patch.cm_approved = data.cmApproved;
    if (data.adminApproved !== undefined) patch.admin_approved = data.adminApproved;
    if (data.approvedForPosting !== undefined) {
      patch.approved_for_posting = data.approvedForPosting;
    }
    if (data.teamNotes !== undefined) patch.team_notes = data.teamNotes;
    if (data.internalNotes !== undefined) patch.internal_notes = data.internalNotes;

    // Sending a deliverable to her opens a five working day review window.
    if (data.stage === "client_review") {
      patch.review_due_at = new Date(Date.now() + 7 * 86400000).toISOString();
    }

    if (data.id) {
      const { error } = await supabaseAdmin.from("deliverables").update(patch).eq("id", data.id);
      if (error) throw new Error("We could not save that.");
      return { id: data.id };
    }

    if (!data.projectId) throw new Error("Pick a project first.");
    const { data: row, error } = await supabaseAdmin
      .from("deliverables")
      .insert({ project_id: data.projectId, title: data.title ?? "New deliverable", ...patch })
      .select("id")
      .single();
    if (error || !row) throw new Error("We could not add that.");
    return { id: row.id as string };
  });

/* ------------------------------ editor side ------------------------------ */

export const listMyAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("deliverables")
      .select("id, title, kind, stage, raw_url, edited_url, editor_due_at, project_id, team_notes")
      .eq("assigned_to", context.userId)
      .order("editor_due_at", { ascending: true });
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    if (rows.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id, name, profile_id")
      .in("id", [...new Set(rows.map((row: { project_id: string }) => row.project_id))]);

    const ids = (projects ?? []).map((p) => p.profile_id).filter(Boolean) as string[];
    const people = new Map<string, { full_name: string | null; business_name: string | null }>();
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, business_name")
        .in("id", ids);
      for (const profile of profiles ?? []) {
        people.set(profile.id, {
          full_name: profile.full_name,
          business_name: profile.business_name,
        });
      }
    }

    return rows.map((row: { project_id: string }) => {
      const project = (projects ?? []).find((p) => p.id === row.project_id);
      return {
        ...row,
        projectName: project?.name ?? "Project",
        person: project?.profile_id ? (people.get(project.profile_id) ?? null) : null,
      };
    });
  });

export const updateMyAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        editedUrl: z.string().trim().max(600).optional(),
        stage: z.enum(["editing", "team_review"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const patch: Database["public"]["Tables"]["deliverables"]["Update"] = {};
    if (data.editedUrl !== undefined) patch.edited_url = data.editedUrl || null;
    if (data.stage !== undefined) patch.stage = data.stage;
    const { error } = await context.supabase
      .from("deliverables")
      .update(patch)
      .eq("id", data.id)
      .eq("assigned_to", context.userId);
    if (error) throw new Error("We could not save that.");
    return { ok: true as const };
  });

/* ------------------------------ member side ------------------------------ */

export const getMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, name, type, status, stage, due_at, created_at")
      .eq("profile_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: project } = await context.supabase
      .from("projects")
      .select("id, name, type, status, stage, due_at, created_at")
      .eq("id", data.id)
      .eq("profile_id", context.userId)
      .maybeSingle();
    if (!project) return null;

    const [stages, deliverables] = await Promise.all([
      context.supabase
        .from("project_stages")
        .select("id, name, sort_order, status, completed_at")
        .eq("project_id", data.id)
        .order("sort_order", { ascending: true }),
      context.supabase
        .from("deliverables")
        .select(
          "id, title, kind, stage, final_url, published_url, review_due_at, revisions_used, revisions_allowed, team_notes",
        )
        .eq("project_id", data.id)
        .order("created_at", { ascending: true }),
    ]);

    return {
      project,
      stages: stages.data ?? [],
      deliverables: deliverables.data ?? [],
    };
  });

export const reviewDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["approve", "request_revision"]),
        comment: z.string().trim().max(2000).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: deliverable } = await context.supabase
      .from("deliverables")
      .select("id, revisions_used, revisions_allowed, stage")
      .eq("id", data.id)
      .maybeSingle();
    if (!deliverable) throw new Error("We cannot find that piece.");

    if (
      data.action === "request_revision" &&
      deliverable.revisions_used >= deliverable.revisions_allowed
    ) {
      throw new Error(
        "You have used the changes included with this piece. Email us and we will talk it through.",
      );
    }

    const { error: reviewError } = await context.supabase.from("deliverable_reviews").insert({
      deliverable_id: data.id,
      reviewer_id: context.userId,
      action: data.action,
      comment: data.comment || null,
    });
    if (reviewError) throw new Error("We could not save that. Please try again.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("deliverables")
      .update(
        data.action === "approve"
          ? { stage: "approved", approved_for_posting: true }
          : {
              stage: "changes_requested",
              revisions_used: deliverable.revisions_used + 1,
            },
      )
      .eq("id", data.id);

    return { ok: true as const };
  });
