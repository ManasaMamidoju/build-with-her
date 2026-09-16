-- Public interview list must never expose guest email/phone.
-- 1) A view that only ever returns the safe, public columns for Posted interviews.
create or replace view public.interviews_public as
select
  id,
  slug,
  full_name,
  business_name,
  instagram,
  event_name,
  interview_date,
  final_video_link,
  posted_links
from public.interviews
where consent_confirmed
  and approved_for_posting
  and overall_status = 'Posted';

grant select on public.interviews_public to anon, authenticated;

-- 2) The base table is no longer readable by anonymous visitors.
drop policy if exists "Anyone can read posted interviews" on public.interviews;
