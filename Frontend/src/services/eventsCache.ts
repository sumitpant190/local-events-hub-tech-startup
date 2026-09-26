import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EventItem } from './types';

// Offline cache for the public events list only. Nothing per-user (RSVPs, profile, token) is stored,
// so the cache is safe to share across accounts on one device. Bump the key if EventItem changes shape.
const CACHE_KEY = 'leh:events:v1';

export interface CachedEvents {
  savedAt: string; // ISO-8601
  events: EventItem[];
}

// Storage is outside our control (older app versions, manual edits), so check the shape before trusting it.
function isEventItem(value: unknown): value is EventItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<EventItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.startsAt === 'string' &&
    typeof item.attendeeCount === 'number' &&
    typeof item.capacity === 'number' &&
    typeof item.location?.venue === 'string'
  );
}

function isCachedEvents(value: unknown): value is CachedEvents {
  if (typeof value !== 'object' || value === null) return false;
  const cached = value as Partial<CachedEvents>;
  return typeof cached.savedAt === 'string' && Array.isArray(cached.events) && cached.events.every(isEventItem);
}

/** Returns null when there is no usable cache (missing, corrupt, or unreadable). */
export async function readCachedEvents(): Promise<CachedEvents | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCachedEvents(parsed) ? parsed : null;
  } catch {
    return null; // A broken cache only means we fall back to the network.
  }
}

export async function writeCachedEvents(events: EventItem[]): Promise<void> {
  const payload: CachedEvents = { savedAt: new Date().toISOString(), events };
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Best-effort: failing to cache must never break a successful load.
  }
}
