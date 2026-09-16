-- Interviews: the public view runs with the querying user's rights, so give anon and
-- signed-in members column-level access to ONLY the safe public columns, and make the
-- row policy explicit. Staff keep full management through role-restricted policies.
alter view public.interviews_public set (security_invoker = true);

revoke all privileges on public.interviews from anon;
revoke select on public.interviews from authenticated;
grant select (id, slug, full_name, business_name, instagram, event_name, interview_date, final_video_link, posted_links)
  on public.interviews to anon, authenticated;
grant insert, update, delete on public.interviews to authenticated;

drop policy if exists "Team manages interviews" on public.interviews;

create policy "Posted interviews are publicly visible"
on public.interviews
for select
to anon, authenticated
using (consent_confirmed and approved_for_posting and overall_status = 'Posted');

create policy "Team manages interviews"
on public.interviews
for all
to authenticated
using (
  has_role(auth.uid(), 'admin')
  or has_role(auth.uid(), 'content_manager')
  or has_role(auth.uid(), 'editor')
)
with check (
  has_role(auth.uid(), 'admin')
  or has_role(auth.uid(), 'content_manager')
  or has_role(auth.uid(), 'editor')
);

-- Podcast applications: anonymous applicants may not attach their submission to
-- someone else's profile or person record.
drop policy if exists "Anyone can apply" on public.podcast_applications;

create policy "Anyone can apply with own links only"
on public.podcast_applications
for insert
to anon, authenticated
with check ((profile_id is null or profile_id = auth.uid()) and person_id is null);

-- Profiles: members can update their own profile but never the internal CRM
-- fields (lead_stage, tags). Service role (auth.uid() is null) is always allowed.
create or replace function public.guard_profile_crm_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not coalesce(public.has_role(auth.uid(), 'admin'), false)
     and (new.lead_stage is distinct from old.lead_stage or new.tags is distinct from old.tags) then
    new.lead_stage := old.lead_stage;
    new.tags := old.tags;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_crm_fields on public.profiles;
create trigger guard_profile_crm_fields
before update on public.profiles
for each row execute function public.guard_profile_crm_fields();

-- Security-definer helpers are only called server-side with the service role.
revoke execute on function public.people_find_or_create(text, text, text, text, text, text, text, uuid) from anon, authenticated;
revoke execute on function public.people_merge(uuid, uuid) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.increment_blog_post_view(text) from anon, authenticated;
grant execute on function public.increment_blog_post_view(text) to service_role;
grant execute on function public.people_find_or_create(text, text, text, text, text, text, text, uuid) to service_role;
grant execute on function public.people_merge(uuid, uuid) to service_role;
