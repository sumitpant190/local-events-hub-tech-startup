import { Timestamp } from 'firebase/firestore';

/**
 * Firestore date fields (events.date, rsvps.updatedAt, comments.createdAt) arrive as Timestamps,
 * not JS Dates or ISO strings. Convert through here before formatting or sorting.
 */
export function toJSDate(value: Timestamp | Date): Date {
  return value instanceof Timestamp ? value.toDate() : value;
}
