/**
 * Availability rules are stored as minutes past midnight in New York time.
 * Until Manasa's calendar is connected we use a fixed eastern offset, which is
 * correct for the months this launch covers.
 */
const NEW_YORK_OFFSET_HOURS = 4;
const DAYS_AHEAD = 21;

export type Slot = { startsAt: string; endsAt: string };

type Rule = {
  weekday: number;
  start_minute: number;
  end_minute: number;
  slot_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
};

type BookedRange = { starts_at: string; ends_at: string };

/** Shared by the member calendar and the public podcast calendar. */
export function computeSlots(
  rules: Rule[],
  bookedRanges: BookedRange[],
  durationMinutes: number,
): Slot[] {
  const taken = bookedRanges.map((row) => ({
    start: new Date(row.starts_at).getTime(),
    end: new Date(row.ends_at).getTime(),
  }));

  const now = Date.now();
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset += 1) {
    const day = new Date(now + dayOffset * 86400000);
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth();
    const d = day.getUTCDate();
    const weekday = new Date(Date.UTC(y, m, d)).getUTCDay();

    for (const rule of rules.filter((r) => r.weekday === weekday)) {
      const step = Math.max(rule.slot_minutes, durationMinutes) + rule.buffer_minutes;
      const noticeMs = rule.min_notice_hours * 3600000;

      for (
        let minute = rule.start_minute;
        minute + durationMinutes <= rule.end_minute;
        minute += step
      ) {
        const start = Date.UTC(y, m, d, NEW_YORK_OFFSET_HOURS, minute);
        const end = start + durationMinutes * 60000;
        if (start < now + noticeMs) continue;
        const clash = taken.some((b) => start < b.end && end > b.start);
        if (clash) continue;
        slots.push({
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
        });
      }
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 60);
}
