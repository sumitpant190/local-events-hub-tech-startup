import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timestamp } from 'firebase/firestore';
import type { EventItem } from './types';

// Offline cache for the public events list only. Nothing per-user (RSVPs, profile) is stored,
// so the cache is safe to share across accounts on one device. Bump the key if EventItem changes shape.
const CACHE_KEY = 'leh:events:v2';

// JSON can't hold a Firestore Timestamp, so `date` is stored as epoch milliseconds.
type StoredEvent = Omit<EventItem, 'date'> & { date: number };

interface StoredCache {
  savedAt: string; // ISO-8601
  events: StoredEvent[];
}

export interface CachedEvents {
  savedAt: string;
  events: EventItem[];
}

// Storage is outside our control (older app versions, manual edits), so check the shape before trusting it.
function isStoredEvent(value: unknown): value is StoredEvent {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<StoredEvent>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.date === 'number' &&
    typeof item.location === 'string' &&
    typeof item.attendeeCount === 'number' &&
    typeof item.commentCount === 'number'
  );
}

function isStoredCache(value: unknown): value is StoredCache {
  if (typeof value !== 'object' || value === null) return false;
  const cached = value as Partial<StoredCache>;
  return typeof cached.savedAt === 'string' && Array.isArray(cached.events) && cached.events.every(isStoredEvent);
}

/** Returns null when there is no usable cache (missing, corrupt, or unreadable). */
export async function readCachedEvents(): Promise<CachedEvents | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredCache(parsed)) return null;
    return {
      savedAt: parsed.savedAt,
      events: parsed.events.map((event) => ({ ...event, date: Timestamp.fromMillis(event.date) })),
    };
  } catch {
    return null; // A broken cache only means we fall back to the network.
  }
}

export async function writeCachedEvents(events: EventItem[]): Promise<void> {
  const payload: StoredCache = {
    savedAt: new Date().toISOString(),
    events: events.map((event) => ({ ...event, date: event.date.toMillis() })),
  };
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Best-effort: failing to cache must never break a successful load.
  }
}
