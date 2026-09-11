# Move the Pipeline onto people

## Goal
Make `people` the source of truth for lead stage so every canonical person can appear once in the Studio Pipeline, whether or not she has signed in.

## Changes
1. Add `lead_stage` to `people`, defaulting to `new`, and copy each linked account's existing stage from `profiles`.
2. Keep `profiles.lead_stage` temporarily for compatibility, but stop reading or writing it from the Pipeline and current People tools.
3. Update the Pipeline query to read canonical people records and update stages by `person_id`.
4. Update the People list/detail queries so stage filters and displayed stage use `people.lead_stage`.
5. Verify the Pipeline and People pages load, moving a person changes the canonical record, and no remaining active Pipeline code depends on profile stages.

## Technical details
- Apply the schema change through a database migration.
- Preserve the existing six stages: new, contacted, call booked, proposal, client, and past.
- Do not remove the old profile field in this pass.
- Keep admin-only access and existing manual stage controls unchanged.
