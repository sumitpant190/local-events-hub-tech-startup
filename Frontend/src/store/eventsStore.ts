import { create } from 'zustand';
import { fetchEvents } from '../services/mockApi';
import type { EventItem } from '../services/types';

interface EventsState {
  events: EventItem[];
  selectedEvent: EventItem | null;
  isLoading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  clearSelectedEvent: () => void;
}

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

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

  clearSelectedEvent: () => set({ selectedEvent: null }),
}));
