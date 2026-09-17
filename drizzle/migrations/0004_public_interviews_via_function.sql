-- Replace the public view with a locked function that can only ever return the
-- safe, public fields of Posted interviews. No policy on the base table exposes
-- rows to anonymous callers, and contact details stay on the interviews table
-- for staff-only access.
drop view if exists public.interviews_public;

drop policy if exists "Posted interviews are publicly visible" on public.interviews;

revoke select (id, slug, full_name, business_name, instagram, event_name, interview_date, final_video_link, posted_links) on public.interviews from anon;
revoke select (id, slug, full_name, business_name, instagram, event_name, interview_date, final_video_link, posted_links) on public.interviews from authenticated;

create or replace function public.list_public_interviews()
returns table (
  slug text,
  full_name text,
  business_name text,
  instagram text,
  event_name text,
  interview_date text,
  final_video_link text,
  posted_links text
)
language sql
stable
security definer
set search_path = public
as $$
  select i.slug, i.full_name, i.business_name, i.instagram, i.event_name, i.interview_date, i.final_video_link, i.posted_links
  from public.interviews i
  where i.consent_confirmed
    and i.approved_for_posting
    and i.overall_status = 'Posted'
  order by i.full_name asc
$$;

revoke all on function public.list_public_interviews() from public;
grant execute on function public.list_public_interviews() to anon, authenticated;
