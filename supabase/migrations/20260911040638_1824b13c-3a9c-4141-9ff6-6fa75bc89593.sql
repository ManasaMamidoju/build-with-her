CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 1. canonical people table -------------------------------------------------
CREATE TABLE public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email extensions.citext,
  business_name text,
  phone text,
  primary_source text,
  source_detail text,
  industry_id uuid REFERENCES public.industries(id) ON DELETE SET NULL,
  business_type text,
  website text,
  city text,
  photo_url text,
  consent_confirmed boolean NOT NULL DEFAULT false,
  consent_confirmed_at timestamptz,
  research_status text NOT NULL DEFAULT 'not_started',
  research_summary text,
  blocked boolean NOT NULL DEFAULT false,
  blocked_reason text,
  tags text[] NOT NULL DEFAULT '{}',
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  identity_status text NOT NULL DEFAULT 'name_only'
    CHECK (identity_status IN ('email', 'handle', 'name_only')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can read people" ON public.people
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_manager')
    OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins and content managers can add people" ON public.people
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins and content managers can update people" ON public.people
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can delete people" ON public.people
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX people_email_unique_idx ON public.people (email) WHERE email IS NOT NULL;
CREATE INDEX people_profile_id_idx ON public.people (profile_id);
CREATE INDEX people_identity_status_idx ON public.people (identity_status);

-- 2. normalizers ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.people_normalize_email(_value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT nullif(lower(trim(coalesce(_value, ''))), '')
$$;

CREATE OR REPLACE FUNCTION public.people_normalize_name(_value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT nullif(lower(regexp_replace(trim(coalesce(_value, '')), '\s+', ' ', 'g')), '')
$$;

CREATE OR REPLACE FUNCTION public.people_normalize_handle(_value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT nullif(
    substring(
      regexp_replace(
        regexp_replace(lower(trim(coalesce(_value, ''))), '^(https?://)?(www\.)?[a-z0-9-]+\.[a-z]{2,}/', ''),
        '^@+', ''
      )
      FROM '^[a-z0-9._-]+'
    ),
    ''
  )
$$;

CREATE INDEX people_name_normalized_idx ON public.people (public.people_normalize_name(full_name));

-- 3. person_id on every source table ---------------------------------------
ALTER TABLE public.score_submissions   ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.waitlists           ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.podcast_applications ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.event_attendees     ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.interviews          ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.touchpoints         ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE SET NULL;
ALTER TABLE public.person_handles      ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE CASCADE;
ALTER TABLE public.person_notes        ADD COLUMN person_id uuid REFERENCES public.people(id) ON DELETE CASCADE;

CREATE INDEX score_submissions_person_id_idx ON public.score_submissions (person_id);
CREATE INDEX waitlists_person_id_idx ON public.waitlists (person_id);
CREATE INDEX podcast_applications_person_id_idx ON public.podcast_applications (person_id);
CREATE INDEX event_attendees_person_id_idx ON public.event_attendees (person_id);
CREATE INDEX interviews_person_id_idx ON public.interviews (person_id);
CREATE INDEX touchpoints_person_id_idx ON public.touchpoints (person_id);
CREATE INDEX person_handles_person_id_idx ON public.person_handles (person_id);
CREATE INDEX person_notes_person_id_idx ON public.person_notes (person_id);

-- handles no longer need a placeholder sign-in account behind them
ALTER TABLE public.person_handles ALTER COLUMN profile_id DROP NOT NULL;

-- 4. match-or-create -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.people_find_or_create(
  _full_name text,
  _email text DEFAULT NULL,
  _handle text DEFAULT NULL,
  _platform text DEFAULT 'instagram',
  _business_name text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _source text DEFAULT NULL,
  _profile_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
  v_handle text;
  v_name text;
  v_id uuid;
  v_handle_row uuid;
BEGIN
  v_name := coalesce(nullif(trim(coalesce(_full_name, '')), ''), 'Name not recorded');
  v_email := public.people_normalize_email(_email);

  IF v_email IS NULL AND _profile_id IS NOT NULL THEN
    SELECT public.people_normalize_email(p.email) INTO v_email
    FROM public.profiles p WHERE p.id = _profile_id;
  END IF;

  -- (a) email match
  IF v_email IS NOT NULL THEN
    SELECT id INTO v_id FROM public.people WHERE email = v_email::extensions.citext LIMIT 1;
    IF v_id IS NULL THEN
      INSERT INTO public.people (full_name, email, business_name, phone, primary_source, identity_status, profile_id)
      VALUES (v_name, v_email::extensions.citext, _business_name, _phone, _source, 'email', _profile_id)
      RETURNING id INTO v_id;
    ELSE
      UPDATE public.people SET
        business_name = coalesce(business_name, _business_name),
        phone = coalesce(phone, _phone),
        primary_source = coalesce(primary_source, _source),
        profile_id = coalesce(profile_id, _profile_id),
        identity_status = 'email'
      WHERE id = v_id;
    END IF;
    RETURN v_id;
  END IF;

  -- (b) handle match
  v_handle := public.people_normalize_handle(_handle);
  IF v_handle IS NOT NULL THEN
    SELECT h.id, h.person_id INTO v_handle_row, v_id
    FROM public.person_handles h
    WHERE lower(h.platform) = lower(coalesce(_platform, 'instagram'))
      AND public.people_normalize_handle(h.handle) = v_handle
    ORDER BY (h.person_id IS NULL), h.created_at
    LIMIT 1;

    IF v_id IS NULL AND _profile_id IS NOT NULL THEN
      SELECT id INTO v_id FROM public.people WHERE profile_id = _profile_id LIMIT 1;
    END IF;

    IF v_id IS NULL THEN
      INSERT INTO public.people (full_name, business_name, phone, primary_source, identity_status, profile_id)
      VALUES (v_name, _business_name, _phone, _source, 'handle', _profile_id)
      RETURNING id INTO v_id;
    ELSE
      UPDATE public.people SET
        business_name = coalesce(business_name, _business_name),
        phone = coalesce(phone, _phone),
        primary_source = coalesce(primary_source, _source),
        profile_id = coalesce(profile_id, _profile_id),
        identity_status = CASE WHEN identity_status = 'name_only' THEN 'handle' ELSE identity_status END
      WHERE id = v_id;
    END IF;

    IF v_handle_row IS NOT NULL THEN
      UPDATE public.person_handles
      SET person_id = v_id, profile_id = coalesce(profile_id, _profile_id)
      WHERE id = v_handle_row;
    ELSIF NOT EXISTS (
      SELECT 1 FROM public.person_handles h
      WHERE h.person_id = v_id
        AND lower(h.platform) = lower(coalesce(_platform, 'instagram'))
        AND public.people_normalize_handle(h.handle) = v_handle
    ) THEN
      INSERT INTO public.person_handles (person_id, profile_id, platform, handle)
      VALUES (v_id, _profile_id, lower(coalesce(_platform, 'instagram')), v_handle)
      ON CONFLICT (profile_id, platform) DO UPDATE SET person_id = excluded.person_id;
    END IF;

    RETURN v_id;
  END IF;

  -- (c) name only
  IF _profile_id IS NOT NULL THEN
    SELECT id INTO v_id FROM public.people WHERE profile_id = _profile_id LIMIT 1;
  END IF;

  IF v_id IS NULL THEN
    SELECT id INTO v_id FROM public.people
    WHERE email IS NULL
      AND identity_status = 'name_only'
      AND public.people_normalize_name(full_name) = public.people_normalize_name(v_name)
    LIMIT 1;
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.people (full_name, business_name, phone, primary_source, identity_status, profile_id)
    VALUES (v_name, _business_name, _phone, _source, 'name_only', _profile_id)
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.people_find_or_create(text, text, text, text, text, text, text, uuid) FROM anon, authenticated;

-- 5. backfill --------------------------------------------------------------
DO $backfill$
DECLARE r record; v_person uuid;
BEGIN
  -- interviews first: they carry the handles for the original tracker
  FOR r IN SELECT * FROM public.interviews ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      r.full_name, r.email, coalesce(nullif(trim(coalesce(r.instagram, '')), ''), r.other_links),
      'instagram', r.business_name, r.phone, 'interview_tracker', r.profile_id
    );
    UPDATE public.interviews SET person_id = v_person WHERE id = r.id;
    IF r.consent_confirmed THEN
      UPDATE public.people
      SET consent_confirmed = true,
          consent_confirmed_at = coalesce(consent_confirmed_at, r.created_at)
      WHERE id = v_person;
    END IF;
  END LOOP;

  -- existing handle rows keyed to a profile now point at that person too
  UPDATE public.person_handles h
  SET person_id = p.id
  FROM public.people p
  WHERE h.person_id IS NULL AND h.profile_id IS NOT NULL AND p.profile_id = h.profile_id;

  FOR r IN SELECT * FROM public.score_submissions ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      r.full_name, r.email, r.handles->>'instagram', 'instagram',
      r.business_name, r.phone, coalesce(r.primary_source, 'findability_score'), r.claimed_by
    );
    UPDATE public.score_submissions SET person_id = v_person WHERE id = r.id;
    UPDATE public.people SET
      website = coalesce(website, r.website),
      primary_source = coalesce(primary_source, r.primary_source)
    WHERE id = v_person;
  END LOOP;

  FOR r IN SELECT * FROM public.waitlists ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      r.full_name, r.email, NULL, 'instagram', r.business_name, r.phone,
      coalesce(r.source, 'waitlist'), NULL
    );
    UPDATE public.waitlists SET person_id = v_person WHERE id = r.id;
  END LOOP;

  FOR r IN SELECT * FROM public.podcast_applications ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      r.full_name, r.email, r.instagram, 'instagram', r.business_name, r.phone,
      coalesce(r.source, 'podcast_application'), r.profile_id
    );
    UPDATE public.podcast_applications SET person_id = v_person WHERE id = r.id;
    UPDATE public.people SET
      website = coalesce(website, r.website),
      city = coalesce(city, r.city)
    WHERE id = v_person;
  END LOOP;

  FOR r IN SELECT * FROM public.event_attendees ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      r.full_name, r.email, NULL, 'instagram', r.business_name, NULL, 'event', r.profile_id
    );
    UPDATE public.event_attendees SET person_id = v_person WHERE id = r.id;
  END LOOP;

  FOR r IN SELECT * FROM public.touchpoints ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      coalesce(r.detail->>'fullName', 'Name not recorded'), r.email, NULL, 'instagram',
      r.detail->>'businessName', NULL, coalesce(r.source, r.kind), r.profile_id
    );
    UPDATE public.touchpoints SET person_id = v_person WHERE id = r.id;
  END LOOP;

  UPDATE public.person_notes n
  SET person_id = p.id
  FROM public.people p
  WHERE n.person_id IS NULL AND p.profile_id = n.profile_id;

  -- any remaining profile with no people row yet (real sign-ins included)
  FOR r IN SELECT * FROM public.profiles pr
           WHERE NOT EXISTS (SELECT 1 FROM public.people p WHERE p.profile_id = pr.id)
           ORDER BY created_at LOOP
    v_person := public.people_find_or_create(
      coalesce(r.full_name, 'Name not recorded'), r.email, NULL, 'instagram',
      r.business_name, r.phone, r.primary_source, r.id
    );
    UPDATE public.people SET
      tags = CASE WHEN cardinality(tags) = 0 THEN r.tags ELSE tags END
    WHERE id = v_person;
  END LOOP;
END $backfill$;

-- drop duplicate handle rows that now point at the same person
DELETE FROM public.person_handles a
USING public.person_handles b
WHERE a.person_id IS NOT NULL
  AND a.person_id = b.person_id
  AND lower(a.platform) = lower(b.platform)
  AND public.people_normalize_handle(a.handle) = public.people_normalize_handle(b.handle)
  AND (a.created_at, a.id) > (b.created_at, b.id);

-- 6. manual review queue ---------------------------------------------------
CREATE OR REPLACE VIEW public.people_merge_candidates
WITH (security_invoker = true) AS
WITH n AS (
  SELECT id, full_name, public.people_normalize_name(full_name) AS nm, email, identity_status, created_at
  FROM public.people
)
SELECT a.id AS person_a_id, a.full_name AS person_a_name, a.identity_status AS person_a_identity, a.email AS person_a_email,
       b.id AS person_b_id, b.full_name AS person_b_name, b.identity_status AS person_b_identity, b.email AS person_b_email,
       CASE
         WHEN 'name_only' IN (a.identity_status, b.identity_status)
              AND a.identity_status <> b.identity_status THEN 'name_only_meets_reachable'
         ELSE 'same_name'
       END AS reason,
       1.0::real AS name_similarity
FROM n a
JOIN n b ON a.id < b.id AND a.nm = b.nm
WHERE a.nm IS NOT NULL
  AND (a.email IS NULL OR b.email IS NULL OR a.email <> b.email)
UNION ALL
SELECT a.id, a.full_name, a.identity_status, a.email,
       b.id, b.full_name, b.identity_status, b.email,
       'name_only_close_match' AS reason,
       extensions.similarity(a.nm, b.nm) AS name_similarity
FROM n a
JOIN n b ON b.identity_status <> 'name_only'
WHERE a.identity_status = 'name_only'
  AND a.nm IS NOT NULL AND b.nm IS NOT NULL
  AND a.nm <> b.nm
  AND extensions.similarity(a.nm, b.nm) > 0.72;

GRANT SELECT ON public.people_merge_candidates TO authenticated;
GRANT ALL ON public.people_merge_candidates TO service_role;