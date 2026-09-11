-- Abby's LinkedIn link was filed as an Instagram handle and never linked
UPDATE public.person_handles h
SET platform = 'linkedin',
    handle = 'abbykohut',
    person_id = COALESCE(h.person_id, p.id)
FROM public.people p
WHERE h.profile_id = p.profile_id
  AND h.handle ILIKE '%linkedin.com%';

-- placeholder handles are not a real way to reach her
CREATE TEMP TABLE placeholder_handle_people AS
SELECT DISTINCT person_id
FROM public.person_handles
WHERE person_id IS NOT NULL
  AND (
    public.people_normalize_handle(handle) LIKE '%\_unknown'
    OR public.people_normalize_handle(handle) LIKE '%no\_ig%'
  );

DELETE FROM public.person_handles
WHERE public.people_normalize_handle(handle) LIKE '%\_unknown'
   OR public.people_normalize_handle(handle) LIKE '%no\_ig%';

UPDATE public.people p
SET identity_status = 'name_only'
FROM placeholder_handle_people ph
WHERE p.id = ph.person_id
  AND p.email IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.person_handles h WHERE h.person_id = p.id);

DROP TABLE placeholder_handle_people;