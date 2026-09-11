CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  step text,
  price text,
  price_note text,
  duration text,
  summary text,
  best_for text,
  includes text[] NOT NULL DEFAULT '{}',
  requires text[] NOT NULL DEFAULT '{}',
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label text,
  cta_note text,
  waitlist boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active services" ON public.services
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.band_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  band text NOT NULL UNIQUE,
  min_score integer NOT NULL,
  max_score integer NOT NULL,
  line text,
  headline text,
  primary_service_slug text REFERENCES public.services(slug) ON DELETE SET NULL,
  secondary_service_slug text REFERENCES public.services(slug) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.band_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.band_rules TO authenticated;
GRANT ALL ON public.band_rules TO service_role;
ALTER TABLE public.band_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active band rules" ON public.band_rules
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage band rules" ON public.band_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_band_rules_updated_at
  BEFORE UPDATE ON public.band_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (slug, name, step, price, price_note, duration, summary, best_for, includes, requires, faqs, cta_label, cta_note, waitlist, sort_order) VALUES
(
  'clarity-call', 'Clarity Call', 'Start here', 'Free', NULL, '30 to 60 minutes',
  $t$We read your Findability Score together, name the one thing costing you the most money, and decide what you fix first.$t$,
  $t$Any woman who has taken the score and wants a plan she can act on this week.$t$,
  ARRAY[
    $t$A read of your score, area by area, in plain words$t$,
    $t$The single fix that pays back fastest for your business$t$,
    $t$A written next step in your inbox after the call$t$,
    $t$An honest answer on whether you need us at all$t$
  ],
  ARRAY[$t$Your Findability Score, so we are not guessing$t$],
  $j$[
    {"q":"Is this a sales call?","a":"It is a working call. If a paid build is the right answer we will say so, and if free tools will do the job we will say that instead."},
    {"q":"What if I have no website yet?","a":"That is common and it is fine. We will start from what you already have, even if that is one social account."}
  ]$j$::jsonb,
  $t$Book your Clarity Call$t$, $t$Booking opens shortly. Take the score first and we will hold your place.$t$, false, 1
),
(
  'strategy-consult', '2-Hour Strategy Consult', 'Go deeper', '$200', 'Paid when you book', '2 hours',
  $t$Two focused hours on your offer, your pricing, your pages and your follow up, ending with a build plan you own whether you hire us or not.$t$,
  $t$A woman who already sells something and wants a sharp plan rather than someone to do the work.$t$,
  ARRAY[
    $t$A rewrite of how you describe what you sell$t$,
    $t$Your pricing and packages reviewed against what buyers already pay you$t$,
    $t$A page-by-page map of what to publish and in what order$t$,
    $t$The recording and the written plan, yours to keep$t$
  ],
  ARRAY[$t$Your Findability Score$t$, $t$Payment when you book$t$],
  $j$[
    {"q":"Can we split it into two sessions?","a":"Yes. Most women do one hour, go and try things, then come back for the second hour."},
    {"q":"Does the fee come off a build?","a":"Yes. If you start a build within 30 days, the $200 comes off the build price."}
  ]$j$::jsonb,
  $t$Book your strategy consult$t$, $t$Payment and booking open shortly. Take the score and we will invite you first.$t$, false, 2
),
(
  'automation-build', 'Automation Build', 'We build it', 'From $3,500', 'Pay in full or split it', '4 to 6 weeks',
  $t$We build the machine: the site, the booking, the payment, the replies, the reminders and the follow up, then hand you the keys.$t$,
  $t$A woman losing bookings to slow replies, missed messages and work she is doing by hand.$t$,
  ARRAY[
    $t$Your site on your own domain, written for the thing you sell$t$,
    $t$Booking and card payment that work while you are with a client$t$,
    $t$Instant replies, confirmations and reminders that cut no-shows$t$,
    $t$Review requests after every job, shown as proof on your pages$t$,
    $t$A walkthrough recording and one month of support after handover$t$
  ],
  ARRAY[$t$A Clarity Call first$t$, $t$An accepted offer before we start$t$],
  $j$[
    {"q":"Do I own everything at the end?","a":"Yes. The domain, the site, the accounts and the data are in your name from day one."},
    {"q":"Can I pay in instalments?","a":"Yes. Builds can be split, and every build is invoiced so you have a record for your books."},
    {"q":"Can you add a podcast to a build?","a":"Yes, and it is the most common addition. We film once and it feeds your pages for months."}
  ]$j$::jsonb,
  $t$Start with a Clarity Call$t$, $t$Builds start after a call, so we quote the real job and not a guess.$t$, false, 3
),
(
  'bootcamp', 'Bootcamp', 'Learn to run it', '$2,500', 'Waitlist only', '5 to 6 weeks, live',
  $t$Five to six weeks, live and in a small group, where you build your own machine with us beside you and leave knowing how to run it.$t$,
  $t$A woman who would rather learn the system than hand it over, and who can give it a few hours a week.$t$,
  ARRAY[
    $t$Live weekly sessions in a small group, recorded for you$t$,
    $t$Your own site, booking and follow up built during the weeks$t$,
    $t$Templates, prompts and checklists you keep using afterwards$t$,
    $t$The other women in your cohort, who stay in touch after$t$
  ],
  ARRAY[$t$Your Findability Score$t$, $t$A few hours a week for five to six weeks$t$],
  $j$[
    {"q":"When is the next cohort?","a":"Dates are set once the waitlist is full enough to run a small group. Join the waitlist and you hear before it is public."},
    {"q":"What if I cannot make a live session?","a":"Every session is recorded and you can send questions in before or after."}
  ]$j$::jsonb,
  $t$Join the bootcamp waitlist$t$, $t$No payment now. We email you before dates are announced anywhere else.$t$, true, 4
),
(
  'podcast-street', 'Podcast, street style', 'Be seen', '$150', NULL, 'About 30 minutes of your day',
  $t$A short, sharp on-the-street conversation about your work, edited into clips built to travel.$t$,
  $t$A woman who wants to be on camera without booking out half a day.$t$,
  ARRAY[
    $t$One short filmed conversation, guided so you never freeze$t$,
    $t$Edited vertical clips with captions$t$,
    $t$Your name, your business and your link in the description$t$,
    $t$Posted on our channels and yours to reuse anywhere$t$
  ],
  ARRAY[$t$Nothing but a date and something you want people to know$t$],
  $j$[
    {"q":"I hate being on camera.","a":"Most women say that first. We ask the questions, keep it short, and cut anything you do not like."},
    {"q":"Where does it get posted?","a":"On our podcast channels, and you get the files to post yourself."}
  ]$j$::jsonb,
  $t$Ask about a street-style spot$t$, $t$Applications open shortly. Take the score and we will contact you when they do.$t$, false, 5
),
(
  'podcast-longform', 'Podcast, long form', 'Be known', '$2,000', NULL, 'Half a day filming',
  $t$A full sit-down episode about your business, cut into a long episode plus a run of clips and one street-style piece.$t$,
  $t$A woman with a story, results and a reason for buyers to trust her over everyone else.$t$,
  ARRAY[
    $t$A full filmed episode with proper sound and lighting$t$,
    $t$Five to six edited clips plus one street-style piece$t$,
    $t$An episode page on our site that links to yours$t$,
    $t$Captions, titles and descriptions written for search$t$
  ],
  ARRAY[$t$A short application so we can plan the episode$t$],
  $j$[
    {"q":"Do I need to prepare?","a":"We send the questions ahead and talk them through before filming, so nothing is a surprise."},
    {"q":"Can this be part of a build?","a":"Yes, and it works better that way, because the episode has somewhere to send people."}
  ]$j$::jsonb,
  $t$Ask about a long-form episode$t$, $t$Applications open shortly. Take the score and we will contact you when they do.$t$, false, 6
),
(
  'custom-offer', 'Custom work', 'For clients already with us', 'Quoted', NULL, 'Depends on the job',
  $t$Extra work for women we already build for: another system, another campaign, another season of content.$t$,
  $t$Existing clients with a job that does not fit the list above.$t$,
  ARRAY[
    $t$A written offer with the scope, the price and the dates$t$,
    $t$One link to accept and pay$t$,
    $t$An invoice for your records$t$
  ],
  ARRAY[$t$Work with us already$t$],
  $j$[
    {"q":"How do I ask for a quote?","a":"Tell us on your next call or reply to any email from us, and a written offer follows."}
  ]$j$::jsonb,
  $t$Ask for a written offer$t$, $t$Custom offers are sent by email as a link you can accept.$t$, false, 7
);

INSERT INTO public.band_rules (band, min_score, max_score, line, headline, primary_service_slug, secondary_service_slug, sort_order) VALUES
('Undiscoverable', 0, 39,
 $t$A buyer looking for exactly what you sell will not find you yet.$t$,
 $t$Start with a free call. Nothing else matters until buyers can find you.$t$,
 'clarity-call', 'bootcamp', 1),
('Invisible with a pulse', 40, 54,
 $t$You exist online, but almost nothing is working to bring you buyers.$t$,
 $t$You have pieces in place. A free call turns them into one working path.$t$,
 'clarity-call', 'automation-build', 2),
('Leaky', 55, 69,
 $t$People do find you. Most of them fall out before they book.$t$,
 $t$People are finding you and slipping away. Plug the leaks first.$t$,
 'automation-build', 'strategy-consult', 3),
('Solid', 70, 84,
 $t$The basics hold. What is missing is the part that compounds.$t$,
 $t$The basics hold. Now make your story do the selling.$t$,
 'podcast-longform', 'automation-build', 4),
('Compounding', 85, 100,
 $t$Your work keeps returning to you. Now it is about scale and story.$t$,
 $t$You are compounding. Add reach and let the work keep returning.$t$,
 'podcast-longform', 'custom-offer', 5);