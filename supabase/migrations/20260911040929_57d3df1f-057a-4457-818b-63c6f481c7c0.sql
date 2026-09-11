REVOKE ALL ON FUNCTION public.people_merge(uuid, uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.people_merge(uuid, uuid) TO service_role;