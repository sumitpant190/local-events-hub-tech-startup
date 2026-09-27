import type { Timestamp } from 'firebase/firestore';

// App-side shapes of the Firestore documents. Field names match the backend schema exactly
// (Backend/src/types.ts); `id` is the document id, which lives in the path, not the document.

export const EVENT_CATEGORIES = [
  'Hackathon',
  'Networking',
  'Workshop',
  'Demo Day',
  'Panel',
  'Pitch Night',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type UserRole = 'attendee' | 'organizer' | 'admin';

/** users/{userId} */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

/** What the UI shows about other members. */
export type PublicUser = Pick<User, 'id' | 'name' | 'avatarUrl'>;

/** events/{eventId} */
export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  category: EventCategory;
  organizerId: string;
  attendeeCount: number;
  commentCount: number;
  imageUrl: string;
}

export type RsvpStatus = 'going' | 'not_going';

/** Result of an RSVP toggle, as committed by the transaction. */
export interface RsvpResult {
  status: RsvpStatus;
  attendeeCount: number;
}

/** events/{eventId}/comments/{commentId} */
export interface EventComment {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}

/** A comment with its author's profile resolved for display. */
export interface CommentWithAuthor extends EventComment {
  author: PublicUser;
}
