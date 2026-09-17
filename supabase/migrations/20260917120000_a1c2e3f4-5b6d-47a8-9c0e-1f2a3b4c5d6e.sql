-- Voice rule: "clients", never "buyers". Update the five seeded rows that still say "buyer(s)".
UPDATE public.services
SET best_for = 'A woman with a story, results and a reason for clients to trust her over everyone else.'
WHERE slug = 'podcast-longform';

UPDATE public.services
SET includes = ARRAY[
  'A rewrite of how you describe what you sell',
  'Your pricing and packages reviewed against what clients already pay you',
  'A page-by-page map of what to publish and in what order',
  'The recording and the written plan, yours to keep'
]
WHERE slug = 'strategy-consult';

UPDATE public.band_rules
SET line = 'Clients looking for exactly what you sell will not find you yet.',
    headline = 'Start with a free call. Nothing else matters until clients can find you.'
WHERE band = 'Undiscoverable';

UPDATE public.band_rules
SET line = 'You exist online, but almost nothing is working to bring you clients.'
WHERE band = 'Invisible with a pulse';
