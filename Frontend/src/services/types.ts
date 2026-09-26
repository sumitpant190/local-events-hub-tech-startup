export const EVENT_CATEGORIES = [
  'Hackathon',
  'Networking',
  'Workshop',
  'Demo Day',
  'Panel',
  'Pitch Night',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  headline: string;
  interests: EventCategory[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface EventLocation {
  venue: string;
  address: string;
  /** Optional: the map is hidden for events without coordinates. */
  coordinates?: Coordinates;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startsAt: string; // ISO-8601
  endsAt: string; // ISO-8601
  location: EventLocation;
  attendeeCount: number;
  capacity: number;
  organizerId: string;
  tags: string[];
}

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  body: string;
  createdAt: string; // ISO-8601
}

// ---- API contract: shapes the backend returns (the mock backend returns the same) ----

/** Other members as the API exposes them: no email or private fields. */
export type PublicUser = Pick<User, 'id' | 'name' | 'headline'>;

/** Comments arrive with their author embedded so the UI never looks users up itself. */
export interface CommentWithAuthor extends EventComment {
  author: PublicUser;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface RsvpStatus {
  eventId: string;
  isGoing: boolean;
  attendeeCount: number;
}

/** Every backend response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
