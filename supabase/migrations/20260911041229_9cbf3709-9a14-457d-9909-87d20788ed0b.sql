CREATE OR REPLACE FUNCTION public.people_merge(_keep_id uuid, _merge_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_keep public.people; v_merge public.people;
BEGIN
  IF _keep_id = _merge_id THEN
    RAISE EXCEPTION 'Pick two different records';
  END IF;

  SELECT * INTO v_keep FROM public.people WHERE id = _keep_id;
  SELECT * INTO v_merge FROM public.people WHERE id = _merge_id;
  IF v_keep.id IS NULL OR v_merge.id IS NULL THEN
    RAISE EXCEPTION 'One of those records no longer exists';
  END IF;

  UPDATE public.score_submissions   SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.waitlists           SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.podcast_applications SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.event_attendees     SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.interviews          SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.touchpoints         SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.person_notes        SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.projects            SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.bookings            SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.episodes            SET guest_person_id = _keep_id WHERE guest_person_id = _merge_id;
  UPDATE public.guest_pages         SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.referrals           SET person_id = _keep_id WHERE person_id = _merge_id;
  UPDATE public.metrics_entries     SET person_id = _keep_id WHERE person_id = _merge_id;

  DELETE FROM public.person_handles h
  WHERE h.person_id = _merge_id
    AND EXISTS (
      SELECT 1 FROM public.person_handles k
      WHERE k.person_id = _keep_id
        AND lower(k.platform) = lower(h.platform)
        AND public.people_normalize_handle(k.handle) = public.people_normalize_handle(h.handle)
    );
  UPDATE public.person_handles SET person_id = _keep_id WHERE person_id = _merge_id;

  UPDATE public.people SET
    full_name = COALESCE(NULLIF(TRIM(full_name), ''), v_merge.full_name),
    email = COALESCE(email, v_merge.email),
    business_name = COALESCE(business_name, v_merge.business_name),
    phone = COALESCE(phone, v_merge.phone),
    primary_source = COALESCE(primary_source, v_merge.primary_source),
    source_detail = COALESCE(source_detail, v_merge.source_detail),
    industry_id = COALESCE(industry_id, v_merge.industry_id),
    business_type = COALESCE(business_type, v_merge.business_type),
    website = COALESCE(website, v_merge.website),
    city = COALESCE(city, v_merge.city),
    photo_url = COALESCE(photo_url, v_merge.photo_url),
    consent_confirmed = consent_confirmed OR v_merge.consent_confirmed,
    consent_confirmed_at = COALESCE(consent_confirmed_at, v_merge.consent_confirmed_at),
    research_summary = COALESCE(research_summary, v_merge.research_summary),
    profile_id = COALESCE(profile_id, v_merge.profile_id),
    tags = (SELECT ARRAY(SELECT DISTINCT unnest(tags || v_merge.tags))),
    identity_status = CASE
      WHEN 'email' IN (identity_status, v_merge.identity_status) THEN 'email'
      WHEN 'handle' IN (identity_status, v_merge.identity_status) THEN 'handle'
      ELSE 'name_only' END
  WHERE id = _keep_id;

  UPDATE public.people SET profile_id = NULL WHERE id = _merge_id;
  DELETE FROM public.people WHERE id = _merge_id;

  RETURN _keep_id;
END $$;

REVOKE ALL ON FUNCTION public.people_merge(uuid, uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.people_merge(uuid, uuid) TO service_role;