// Firestore document shapes. Document ids live in the path, not in the document body.

/** Structural type satisfied by both the Admin SDK and the client SDK Timestamp classes. */
export interface FirestoreTimestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  toDate(): Date;
}

export const USER_ROLES = ['attendee', 'organizer', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EVENT_CATEGORIES = ['Hackathon', 'Networking', 'Pitch Night', 'Workshop', 'Demo Day', 'Panel'] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const RSVP_STATUSES = ['going', 'not_going'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

/** users/{userId} */
export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

/** events/{eventId} */
export interface Event {
  title: string;
  description: string;
  date: FirestoreTimestamp;
  location: string;
  category: EventCategory;
  organizerId: string;
  attendeeCount: number;
  commentCount: number;
  imageUrl: string;
}

/** events/{eventId}/rsvps/{userId} */
export interface Rsvp {
  status: RsvpStatus;
  updatedAt: FirestoreTimestamp;
}

/** events/{eventId}/comments/{commentId} */
export interface Comment {
  userId: string;
  text: string;
  createdAt: FirestoreTimestamp;
}
