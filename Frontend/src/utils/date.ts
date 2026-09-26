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
