-- Tracks whether the day-before reminder email has gone out for a booking,
-- so the reminder cron can run every 15-30 minutes without double-sending.
ALTER TABLE public.bookings ADD COLUMN reminder_sent_at timestamptz;
