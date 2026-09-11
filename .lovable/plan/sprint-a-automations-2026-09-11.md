# Sprint A automations

## Goal
Complete the automatic follow-up for the Findability Score and Bootcamp waitlist without adding unrelated later-sprint workflows.

## Build
- Add a durable email outbox so every automated message has a status, retry count, provider reference, and source-record key.
- Automatically queue and send the `score_result` email after a score is saved, including her score, band, meaning, and private result link.
- Automatically queue and send the `waitlist_confirm` email after a Bootcamp waitlist submission, including the confirmation and next step.
- Use the editable email wording already available in Studio settings, adding the missing waitlist template and required variables.
- Keep submissions successful if email delivery is temporarily unavailable; the outbox retains the message for a safe retry rather than losing the lead.
- Prevent duplicate emails when a submission is retried by using one unique automation key per source record and template.

## Delivery and security
- Send transactional mail from `hello@buildwithhermedia.com` through Resend from server-side code only.
- Keep the Resend credential private and request it through the secure connection flow if it is not already configured.
- Do not add a recurring scheduler. These messages are triggered by the form submissions themselves, which is faster and avoids unnecessary background work.

## Verification
- Run the type checks.
- Submit one score and one Bootcamp waitlist entry in the preview.
- Confirm each source record links to the canonical person, creates one outbox record, and never duplicates on retry.
- Confirm live delivery when the sending credential and domain are available; otherwise verify the messages remain visibly queued and report that external blocker.
