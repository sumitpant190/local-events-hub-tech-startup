// Formatting only. Firestore dates arrive as Timestamps: convert with toJSDate (utils/firestoreDates) first.

export function formatEventDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatEventTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Thu, Oct 15 · 6:00 PM". Events have a start time only (no end time in the schema). */
export function formatEventDateTime(date: Date): string {
  return `${formatEventDate(date)} · ${formatEventTime(date)}`;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_DAYS_LIMIT = 7;

/** "just now", "5m ago", "3h ago", "2d ago", then a short date like "Sep 20". */
export function formatRelativeTime(date: Date, now: number = Date.now()): string {
  const elapsed = Math.max(now - date.getTime(), 0);
  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  if (elapsed < RELATIVE_DAYS_LIMIT * DAY_MS) return `${Math.floor(elapsed / DAY_MS)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Month/day pair for calendar-style date tiles, e.g. { month: 'OCT', day: '09' }. */
export function getDateParts(date: Date): { month: string; day: string } {
  return {
    month: date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    day: String(date.getDate()).padStart(2, '0'),
  };
}
