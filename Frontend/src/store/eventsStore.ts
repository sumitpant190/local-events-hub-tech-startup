import { create } from 'zustand';
import { currentUid } from '../services/authService';
import { getErrorMessage } from '../services/errors';
import { readCachedEvents, writeCachedEvents } from '../services/eventsCache';
import * as eventsService from '../services/eventsService';
import * as rsvpService from '../services/rsvpService';
import type { EventItem } from '../services/types';
import { adjustAttendeeCount } from '../utils/rsvp';

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
  /** Events with an RSVP transaction in flight; further toggles are ignored until it settles. */
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

// Shared so concurrent callers (the list screen and loadMyRsvps) await one request instead of racing.
let inFlightLoad: Promise<void> | null = null;
// The event EventDetails is showing. A fresh copy may arrive before the list has loaded (deep link,
// restored screen), so it's matched against this rather than against selectedEvent.
let openEventId: string | null = null;

export const useEventsStore = create<EventsState>()((set, get) => {
  // Replaces one event in both the list and the open details screen.
  const replaceEvent = (eventId: string, toEvent: (item: EventItem) => EventItem) =>
    set((state) => ({
      events: state.events.map((item) => (item.id === eventId ? toEvent(item) : item)),
      selectedEvent: state.selectedEvent?.id === eventId ? toEvent(state.selectedEvent) : state.selectedEvent,
    }));

  // Re-reads one event from Firestore into the list and, if it's the open one, the details screen.
  // A deleted event leaves both. Failures keep what's on screen (e.g. offline).
  const refreshEvent = async (eventId: string) => {
    try {
      const fresh = await eventsService.getEventById(eventId);
      set((state) => {
        const isOpen = openEventId === eventId;
        if (!fresh) {
          return {
            events: state.events.filter((event) => event.id !== eventId),
            selectedEvent: isOpen ? null : state.selectedEvent,
          };
        }
        return {
          events: state.events.map((event) => (event.id === eventId ? fresh : event)),
          selectedEvent: isOpen ? fresh : state.selectedEvent,
        };
      });
    } catch {
      // Keep the copy on screen.
    }
  };

  const setGoing = (eventId: string, isGoing: boolean) =>
    set((state) => ({
      rsvpEventIds: isGoing
        ? [...new Set([...state.rsvpEventIds, eventId])]
        : state.rsvpEventIds.filter((id) => id !== eventId),
    }));

  const fetchEvents = async () => {
    set({ isLoading: true, error: null });

    // Cold start: show the cached list immediately while the network request runs.
    if (get().events.length === 0) {
      const cached = await readCachedEvents();
      if (cached && get().events.length === 0) set({ events: cached.events, cachedAt: cached.savedAt });
    }

    try {
      const events = await eventsService.getEvents();
      set({ events, isLoading: false, isOffline: false, cachedAt: null });
      void writeCachedEvents(events);
    } catch (error) {
      const message = getErrorMessage(error, 'Could not load events.');
      // With something on screen we degrade to offline mode; with nothing, it's a real error.
      set(get().events.length > 0 ? { isLoading: false, isOffline: true } : { isLoading: false, error: message });
    }
  };

  return {
    events: [],
    selectedEvent: null,
    isLoading: false,
    error: null,
    isOffline: false,
    cachedAt: null,
    rsvpEventIds: [],
    pendingRsvpIds: [],
    rsvpError: null,

    loadEvents: () => {
      inFlightLoad ??= fetchEvents().finally(() => {
        inFlightLoad = null;
      });
      return inFlightLoad;
    },

    loadMyRsvps: async () => {
      const uid = currentUid();
      if (!uid) return;
      if (get().events.length === 0) await get().loadEvents();
      try {
        const rsvpEventIds = await rsvpService.listMyRsvpEventIds(uid, get().events.map((event) => event.id));
        if (currentUid() === uid) set({ rsvpEventIds }); // Signed out or switched account meanwhile: drop it.
      } catch (error) {
        set({ rsvpError: getErrorMessage(error, "Couldn't load your RSVPs.") });
      }
    },

    resetUserState: () => set({ rsvpEventIds: [], pendingRsvpIds: [], rsvpError: null, selectedEvent: null }),

    // Shows the list copy instantly, then refreshes from Firestore so counts are current.
    selectEvent: (eventId) => {
      openEventId = eventId;
      set({ selectedEvent: get().events.find((event) => event.id === eventId) ?? null });
      void refreshEvent(eventId);
    },

    clearSelectedEvent: () => {
      openEventId = null;
      set({ selectedEvent: null, rsvpError: null });
    },

    toggleRsvp: async (eventId) => {
      const uid = currentUid();
      const { events, rsvpEventIds, pendingRsvpIds } = get();
      if (!uid || pendingRsvpIds.includes(eventId) || !events.some((item) => item.id === eventId)) return;

      const wasGoing = rsvpEventIds.includes(eventId);

      // Optimistic: flip now so the button responds instantly…
      setGoing(eventId, !wasGoing);
      replaceEvent(eventId, (item) => adjustAttendeeCount(item, wasGoing ? -1 : 1));
      set((state) => ({ pendingRsvpIds: [...state.pendingRsvpIds, eventId], rsvpError: null }));

      try {
        const result = await rsvpService.toggleRsvp(eventId, uid);
        // Signed out mid-request: resetUserState cleared pending ids, so don't write into the next session.
        if (!get().pendingRsvpIds.includes(eventId)) return;
        // …then adopt what the transaction committed. The count includes other users' RSVPs that landed
        // meanwhile, and the status is the real one even if our local guess was stale.
        setGoing(eventId, result.status === 'going');
        replaceEvent(eventId, (item) => ({ ...item, attendeeCount: result.attendeeCount }));
      } catch (error) {
        if (!get().pendingRsvpIds.includes(eventId)) return;
        setGoing(eventId, wasGoing);
        replaceEvent(eventId, (item) => adjustAttendeeCount(item, wasGoing ? 1 : -1));
        set({ rsvpError: getErrorMessage(error, "Couldn't update your RSVP. Please try again.") });
        // The server refused our view of this event, so our copy may be stale: re-read it.
        void refreshEvent(eventId);
      } finally {
        set((state) => ({ pendingRsvpIds: state.pendingRsvpIds.filter((id) => id !== eventId) }));
      }
    },
  };
});
