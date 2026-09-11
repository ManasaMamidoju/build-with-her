REVOKE ALL ON FUNCTION public.people_find_or_create(text, text, text, text, text, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.people_find_or_create(text, text, text, text, text, text, text, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.people_find_or_create(text, text, text, text, text, text, text, uuid) TO service_role;