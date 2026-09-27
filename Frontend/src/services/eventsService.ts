import { collection, doc, getDoc, getDocs, orderBy, query, type DocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { EventItem } from './types';

function toEvent(snap: DocumentSnapshot): EventItem {
  return { id: snap.id, ...(snap.data() as Omit<EventItem, 'id'>) };
}

/** All events, soonest first. */
export async function getEvents(): Promise<EventItem[]> {
  const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
  return snap.docs.map(toEvent);
}

/** A single event, or null when it no longer exists. */
export async function getEventById(eventId: string): Promise<EventItem | null> {
  const snap = await getDoc(doc(db, 'events', eventId));
  return snap.exists() ? toEvent(snap) : null;
}
