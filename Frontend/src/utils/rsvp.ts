import type { EventItem } from '../services/types';

export function isEventFull(event: EventItem): boolean {
  return event.attendeeCount >= event.capacity;
}

/** Returns a new event with attendeeCount shifted by delta, clamped to [0, capacity]. */
export function adjustAttendeeCount(event: EventItem, delta: number): EventItem {
  const attendeeCount = Math.min(Math.max(event.attendeeCount + delta, 0), event.capacity);
  return { ...event, attendeeCount };
}
