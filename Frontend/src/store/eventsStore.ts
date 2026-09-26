import { create } from 'zustand';
import { fetchEvents, updateRsvp } from '../services/mockApi';
import type { EventItem } from '../services/types';
import { adjustAttendeeCount, isEventFull } from '../utils/rsvp';

interface EventsState {
  events: EventItem[];
  selectedEvent: EventItem | null;
  isLoading: boolean;
  error: string | null;
  /** Events the current user is going to. */
  rsvpEventIds: string[];
  /** Events with an RSVP request in flight; further toggles are ignored until it settles. */
  pendingRsvpIds: string[];
  rsvpError: string | null;
  loadEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  clearSelectedEvent: () => void;
  toggleRsvp: (eventId: string) => Promise<void>;
}

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  rsvpEventIds: [],
  pendingRsvpIds: [],
  rsvpError: null,

  loadEvents: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const events = await fetchEvents();
      set({ events, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Could not load events.' });
    }
  },

  selectEvent: (eventId) =>
    set({ selectedEvent: get().events.find((event) => event.id === eventId) ?? null }),

  clearSelectedEvent: () => set({ selectedEvent: null, rsvpError: null }),

  toggleRsvp: async (eventId) => {
    const { events, rsvpEventIds, pendingRsvpIds } = get();
    const event = events.find((item) => item.id === eventId);
    if (!event || pendingRsvpIds.includes(eventId)) return;

    const wasGoing = rsvpEventIds.includes(eventId);
    if (!wasGoing && isEventFull(event)) return;

    // Writes the going/not-going state and shifts the count in both the list and the open event.
    const applyRsvp = (isGoing: boolean) => {
      const delta = isGoing ? 1 : -1;
      set((state) => ({
        rsvpEventIds: isGoing
          ? [...state.rsvpEventIds, eventId]
          : state.rsvpEventIds.filter((id) => id !== eventId),
        events: state.events.map((item) => (item.id === eventId ? adjustAttendeeCount(item, delta) : item)),
        selectedEvent:
          state.selectedEvent?.id === eventId
            ? adjustAttendeeCount(state.selectedEvent, delta)
            : state.selectedEvent,
      }));
    };

    // Optimistic: update the UI now, reconcile when the request settles.
    applyRsvp(!wasGoing);
    set((state) => ({ pendingRsvpIds: [...state.pendingRsvpIds, eventId], rsvpError: null }));

    try {
      await updateRsvp(eventId, !wasGoing);
    } catch {
      applyRsvp(wasGoing);
      set({ rsvpError: "Couldn't update your RSVP. Please try again." });
    } finally {
      set((state) => ({ pendingRsvpIds: state.pendingRsvpIds.filter((id) => id !== eventId) }));
    }
  },
}));
