import { useEffect, useState } from 'react';
import * as rsvpService from '../services/rsvpService';
import type { PublicUser } from '../services/types';
import * as usersService from '../services/usersService';

const ATTENDEE_PREVIEW_SIZE = 3;

interface EventPeople {
  organizer: PublicUser | null;
  /** Up to 3 other attendees for the avatar stack (current user excluded). */
  attendees: PublicUser[];
}

/** Organizer profile and attendee faces for EventDetails, fetched through the services. */
export function useEventPeople(
  eventId: string,
  organizerId: string | undefined,
  currentUserId: string | undefined,
): EventPeople {
  const [organizer, setOrganizer] = useState<PublicUser | null>(null);
  const [attendees, setAttendees] = useState<PublicUser[]>([]);

  useEffect(() => {
    if (!organizerId) return undefined;
    let isActive = true;
    usersService
      .getUser(organizerId)
      .then((user) => isActive && setOrganizer(user))
      // Decorative: if the lookup fails the screen just omits the organizer card.
      .catch(() => isActive && setOrganizer(null));
    return () => {
      isActive = false;
    };
  }, [organizerId]);

  useEffect(() => {
    let isActive = true;
    // One extra so the preview stays full after removing the current user.
    rsvpService
      .listAttendees(eventId, ATTENDEE_PREVIEW_SIZE + 1)
      .then(
        (people) =>
          isActive &&
          setAttendees(people.filter((person) => person.id !== currentUserId).slice(0, ATTENDEE_PREVIEW_SIZE)),
      )
      // Decorative: the "N people going" label still shows without faces.
      .catch(() => isActive && setAttendees([]));
    return () => {
      isActive = false;
    };
  }, [eventId, currentUserId]);

  return { organizer, attendees };
}
