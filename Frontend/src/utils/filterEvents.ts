import type { EventCategory, EventItem } from '../services/types';

export type CategoryFilter = EventCategory | 'All';

/** Case-insensitive title search combined with an optional category filter. */
export function filterEvents(events: EventItem[], query: string, category: CategoryFilter): EventItem[] {
  const needle = query.trim().toLowerCase();
  return events.filter(
    (event) =>
      (category === 'All' || event.category === category) &&
      (!needle || event.title.toLowerCase().includes(needle)),
  );
}
