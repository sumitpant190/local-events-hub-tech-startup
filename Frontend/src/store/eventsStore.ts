import { create } from 'zustand';
import { getErrorMessage } from '../services/api';
import { readCachedEvents, writeCachedEvents } from '../services/eventsCache';
import * as eventsService from '../services/eventsService';
import * as rsvpService from '../services/rsvpService';
import type { EventItem } from '../services/types';
import { adjustAttendeeCount, isEventFull } from '../utils/rsvp';

interface EventsState {
  events: EventItem[];
  selectedEvent: EventItem | null;
  isLoading: boolean;
  error: string | null;
  /** True when the last refresh failed and `events` are the cached copy from `cachedAt`. */
  isOffline: boolean;
  cachedAt: string | null;
  /** Events the signed-in user is going to. Reloaded per account; cleared on sign-out. */
  rsvpEventIds: string[];
  /** Events with an RSVP request in flight; further toggles are ignored until it settles. */
  pendingRsvpIds: string[];
  rsvpError: string | null;
  loadEvents: () => Promise<void>;
  loadMyRsvps: () => Promise<void>;
  /** Drops everything tied to the signed-in account so the next account starts clean. */
  resetUserState: () => void;
  selectEvent: (eventId: string) => void;
  clearSelectedEvent: () => void;
  toggleRsvp: (eventId: string) => Promise<void>;
}

const withAttendeeCount = (event: EventItem, attendeeCount: number): EventItem => ({ ...event, attendeeCount });

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  isOffline: false,
  cachedAt: null,
  rsvpEventIds: [],
  pendingRsvpIds: [],
  rsvpError: null,

  loadEvents: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    // Cold start: show the cached list immediately while the network request runs.
    if (get().events.length === 0) {
      const cached = await readCachedEvents();
      if (cached && get().events.length === 0) set({ events: cached.events, cachedAt: cached.savedAt });
    }

    try {
      const events = await eventsService.listEvents();
      set({ events, isLoading: false, isOffline: false, cachedAt: null });
      void writeCachedEvents(events);
    } catch (error) {
      const message = getErrorMessage(error, 'Could not load events.');
      // With something on screen we degrade to offline mode; with nothing, it's a real error.
      set(get().events.length > 0 ? { isLoading: false, isOffline: true } : { isLoading: false, error: message });
    }
  },

  loadMyRsvps: async () => {
    try {
      const rsvpEventIds = await rsvpService.listMyRsvpEventIds();
      set({ rsvpEventIds });
    } catch (error) {
      set({ rsvpError: getErrorMessage(error, "Couldn't load your RSVPs.") });
    }
  },

  resetUserState: () => set({ rsvpEventIds: [], pendingRsvpIds: [], rsvpError: null, selectedEvent: null }),

  selectEvent: (eventId) =>
    set({ selectedEvent: get().events.find((event) => event.id === eventId) ?? null }),

  clearSelectedEvent: () => set({ selectedEvent: null, rsvpError: null }),

  toggleRsvp: async (eventId) => {
    const { events, rsvpEventIds, pendingRsvpIds } = get();
    const event = events.find((item) => item.id === eventId);
    if (!event || pendingRsvpIds.includes(eventId)) return;

    const wasGoing = rsvpEventIds.includes(eventId);
    if (!wasGoing && isEventFull(event)) return;

    // Writes the going state and updates the count in both the list and the open event.
    const applyRsvp = (isGoing: boolean, toEvent: (item: EventItem) => EventItem) => {
      set((state) => ({
        rsvpEventIds: isGoing
          ? [...new Set([...state.rsvpEventIds, eventId])]
          : state.rsvpEventIds.filter((id) => id !== eventId),
        events: state.events.map((item) => (item.id === eventId ? toEvent(item) : item)),
        selectedEvent: state.selectedEvent?.id === eventId ? toEvent(state.selectedEvent) : state.selectedEvent,
      }));
    };

    // Optimistic: update the UI now, then adopt the server's answer when it arrives.
    applyRsvp(!wasGoing, (item) => adjustAttendeeCount(item, wasGoing ? -1 : 1));
    set((state) => ({ pendingRsvpIds: [...state.pendingRsvpIds, eventId], rsvpError: null }));

    try {
      const status = await rsvpService.setRsvp(eventId, !wasGoing);
      // Signed out mid-request: resetUserState cleared pending ids, so don't write into the next session.
      if (!get().pendingRsvpIds.includes(eventId)) return;
      applyRsvp(status.isGoing, (item) => withAttendeeCount(item, status.attendeeCount));
    } catch (error) {
      if (!get().pendingRsvpIds.includes(eventId)) return;
      applyRsvp(wasGoing, (item) => adjustAttendeeCount(item, wasGoing ? 1 : -1));
      set({ rsvpError: getErrorMessage(error, "Couldn't update your RSVP. Please try again.") });
    } finally {
      set((state) => ({ pendingRsvpIds: state.pendingRsvpIds.filter((id) => id !== eventId) }));
    }
  },
}));
