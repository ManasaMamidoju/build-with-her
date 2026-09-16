-- Grant the 'client' app_role automatically once a canonical person's CRM
-- stage reaches 'client' (her first paid booking, build, podcast slot or
-- workshop) and she has a signed-in account linked. Pricing on the public
-- site is shown only to this role; everyone else is a lead/visitor.
CREATE OR REPLACE FUNCTION public.grant_client_role_on_lead_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.lead_stage = 'client' AND NEW.profile_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.profile_id, 'client')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS people_grant_client_role ON public.people;
CREATE TRIGGER people_grant_client_role
  AFTER INSERT OR UPDATE OF lead_stage, profile_id ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_client_role_on_lead_stage();

-- Backfill: anyone already marked 'client' in the pipeline picks up the role now.
INSERT INTO public.user_roles (user_id, role)
SELECT profile_id, 'client'
FROM public.people
WHERE lead_stage = 'client' AND profile_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Bookings: allow a guest without an account yet to hold a slot. Today this
-- is only used for public, no-sign-in podcast guest booking; every other
-- booking still requires a signed-in member.
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_owner_present CHECK (
    user_id IS NOT NULL OR (person_id IS NOT NULL AND service_slug LIKE 'podcast-%')
  );
