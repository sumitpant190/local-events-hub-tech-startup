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

export interface EventLocation {
  venue: string;
  address: string;
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
