import { request } from './api';
import { USE_MOCK_DATA } from './config';
import * as mock from './mockApi';
import type { PublicUser, RsvpStatus } from './types';

/** GET /me/rsvps → ids of events the signed-in user is going to. */
export function listMyRsvpEventIds(): Promise<string[]> {
  return USE_MOCK_DATA ? mock.listMyRsvpEventIds() : request<string[]>({ method: 'GET', url: '/me/rsvps' });
}

/** PUT /events/:id/rsvp { isGoing } → authoritative going state and attendee count. */
export function setRsvp(eventId: string, isGoing: boolean): Promise<RsvpStatus> {
  return USE_MOCK_DATA
    ? mock.setRsvp(eventId, isGoing)
    : request<RsvpStatus>({ method: 'PUT', url: `/events/${encodeURIComponent(eventId)}/rsvp`, data: { isGoing } });
}

/** GET /events/:id/attendees?limit=N → a few attendees for the avatar preview. */
export function listAttendees(eventId: string, limit: number): Promise<PublicUser[]> {
  return USE_MOCK_DATA
    ? mock.listAttendees(eventId, limit)
    : request<PublicUser[]>({
        method: 'GET',
        url: `/events/${encodeURIComponent(eventId)}/attendees`,
        params: { limit },
      });
}
