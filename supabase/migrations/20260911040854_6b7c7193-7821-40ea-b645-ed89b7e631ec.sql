-- Step 4: person_id alongside the existing profile links -------------------
ALTER TABLE public.projects        ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.bookings        ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.episodes        ADD COLUMN guest_person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.guest_pages     ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.referrals       ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.metrics_entries ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;

CREATE INDEX projects_person_id_idx ON public.projects (person_id);
CREATE INDEX bookings_person_id_idx ON public.bookings (person_id);
CREATE INDEX episodes_guest_person_id_idx ON public.episodes (guest_person_id);
CREATE INDEX guest_pages_person_id_idx ON public.guest_pages (person_id);
CREATE INDEX referrals_person_id_idx ON public.referrals (person_id);
CREATE INDEX metrics_entries_person_id_idx ON public.metrics_entries (person_id);

UPDATE public.projects t        SET person_id = p.id FROM public.people p WHERE p.profile_id = t.profile_id AND t.person_id IS NULL;
UPDATE public.bookings t        SET person_id = p.id FROM public.people p WHERE p.profile_id = t.user_id   AND t.person_id IS NULL;
UPDATE public.episodes t        SET guest_person_id = p.id FROM public.people p WHERE p.profile_id = t.guest_profile_id AND t.guest_person_id IS NULL;
UPDATE public.guest_pages t     SET person_id = p.id FROM public.people p WHERE p.profile_id = t.profile_id AND t.person_id IS NULL;
UPDATE public.referrals t       SET person_id = p.id FROM public.people p WHERE p.profile_id = t.profile_id AND t.person_id IS NULL;
UPDATE public.metrics_entries t SET person_id = p.id FROM public.people p WHERE p.profile_id = t.profile_id AND t.person_id IS NULL;

-- also link interview-driven projects straight to the interview's person
UPDATE public.projects t
SET person_id = i.person_id
FROM public.interviews i
WHERE t.interview_id = i.id AND t.person_id IS NULL AND i.person_id IS NOT NULL;

-- Step 5: missing fields ----------------------------------------------------
ALTER TABLE public.deliverables ADD COLUMN frameio_url text;
ALTER TABLE public.bookings ADD COLUMN google_event_id text;
ALTER TABLE public.bookings ADD COLUMN meet_link text;

CREATE TABLE public.deliverable_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id uuid NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_role text NOT NULL DEFAULT 'admin',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverable_notes TO authenticated;
GRANT ALL ON public.deliverable_notes TO service_role;

ALTER TABLE public.deliverable_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can read deliverable notes" ON public.deliverable_notes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_manager')
    OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Team can add deliverable notes" ON public.deliverable_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'content_manager')
      OR public.has_role(auth.uid(), 'editor')
    )
  );

CREATE POLICY "Admins can remove deliverable notes" ON public.deliverable_notes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX deliverable_notes_deliverable_id_idx ON public.deliverable_notes (deliverable_id, created_at);

-- Step 3: manual merge, admin only, never automatic -------------------------
CREATE OR REPLACE FUNCTION public.people_merge(_keep_id uuid, _merge_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_keep public.people; v_merge public.people;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can merge people';
  END IF;
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

  -- handles move over unless the kept person already has that platform handle
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

REVOKE ALL ON FUNCTION public.people_merge(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.people_merge(uuid, uuid) TO authenticated, service_role;