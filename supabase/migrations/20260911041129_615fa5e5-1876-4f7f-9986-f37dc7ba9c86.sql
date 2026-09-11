CREATE TEMP TABLE placeholder_profiles AS
SELECT p.id
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.email IS NULL
  AND u.id IS NULL
  AND EXISTS (SELECT 1 FROM public.people pe WHERE pe.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.person_notes n WHERE n.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.touchpoints t WHERE t.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.projects pr WHERE pr.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.metrics_entries m WHERE m.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.guest_pages g WHERE g.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.episodes e WHERE e.guest_profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.referrals r WHERE r.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.event_attendees a WHERE a.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.podcast_applications pa WHERE pa.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);

-- make sure her handle survives the profile going away
UPDATE public.person_handles h
SET person_id = COALESCE(h.person_id, pe.id),
    profile_id = NULL
FROM public.people pe
WHERE pe.profile_id = h.profile_id
  AND h.profile_id IN (SELECT id FROM placeholder_profiles);

UPDATE public.interviews i
SET person_id = COALESCE(i.person_id, pe.id),
    profile_id = NULL
FROM public.people pe
WHERE pe.profile_id = i.profile_id
  AND i.profile_id IN (SELECT id FROM placeholder_profiles);

UPDATE public.people SET profile_id = NULL
WHERE profile_id IN (SELECT id FROM placeholder_profiles);

DELETE FROM public.profiles WHERE id IN (SELECT id FROM placeholder_profiles);

DROP TABLE placeholder_profiles;