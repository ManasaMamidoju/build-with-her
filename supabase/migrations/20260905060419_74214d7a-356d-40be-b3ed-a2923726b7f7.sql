CREATE TABLE public.waitlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  note TEXT,
  source TEXT,
  consent_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX waitlists_email_idx ON public.waitlists (lower(email));
CREATE INDEX waitlists_service_idx ON public.waitlists (service_slug);

GRANT SELECT ON public.waitlists TO authenticated;
GRANT ALL ON public.waitlists TO service_role;

ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read the waitlists"
ON public.waitlists FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));