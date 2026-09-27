import type { EventItem } from '../services/types';

/** Returns a new event with attendeeCount shifted by delta, never below 0. */
export function adjustAttendeeCount(event: EventItem, delta: number): EventItem {
  return { ...event, attendeeCount: Math.max(event.attendeeCount + delta, 0) };
}
