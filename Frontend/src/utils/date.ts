export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** "Thu, Oct 15 · 6:00 PM – 9:00 PM", or both dates when the event spans days. */
export function formatEventRange(startIso: string, endIso: string): string {
  const isSameDay = new Date(startIso).toDateString() === new Date(endIso).toDateString();
  return isSameDay
    ? `${formatEventDate(startIso)} · ${formatEventTime(startIso)} – ${formatEventTime(endIso)}`
    : `${formatEventDate(startIso)}, ${formatEventTime(startIso)} – ${formatEventDate(endIso)}, ${formatEventTime(endIso)}`;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_DAYS_LIMIT = 7;

/** "just now", "5m ago", "3h ago", "2d ago", then a short date like "Sep 20". */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const elapsed = Math.max(now - new Date(iso).getTime(), 0);
  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  if (elapsed < RELATIVE_DAYS_LIMIT * DAY_MS) return `${Math.floor(elapsed / DAY_MS)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Month/day pair for calendar-style date tiles, e.g. { month: 'OCT', day: '09' }. */
export function getDateParts(iso: string): { month: string; day: string } {
  const date = new Date(iso);
  return {
    month: date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    day: String(date.getDate()).padStart(2, '0'),
  };
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
