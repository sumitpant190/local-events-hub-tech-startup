import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { AppError } from './errors';
import { db } from './firebase';
import type { PublicUser, RsvpResult, RsvpStatus } from './types';
import { getUser } from './usersService';

/**
 * Flips the caller's RSVP in one client-side transaction (mirrors Backend/src/services/rsvpService.ts,
 * whose rules tests cover it). Concurrent RSVPs race on the same attendeeCount, so the RSVP doc and
 * the ±1 must commit together, and a commit whose reads went stale is retried by Firestore.
 */
export function toggleRsvp(eventId: string, uid: string): Promise<RsvpResult> {
  const eventRef = doc(db, 'events', eventId);
  const rsvpRef = doc(db, 'events', eventId, 'rsvps', uid);

  return runTransaction(db, async (transaction) => {
    // All reads before any write (a Firestore transaction requirement).
    const [eventSnap, rsvpSnap] = await Promise.all([transaction.get(eventRef), transaction.get(rsvpRef)]);
    if (!eventSnap.exists()) throw new AppError('This event no longer exists.');

    const wasGoing = rsvpSnap.exists() && rsvpSnap.data().status === 'going';
    const status: RsvpStatus = wasGoing ? 'not_going' : 'going';
    const delta = wasGoing ? -1 : 1;

    transaction.set(rsvpRef, { status, updatedAt: serverTimestamp() });
    // increment() is applied to the stored value at commit; the rules check it moved by exactly this RSVP's ±1.
    transaction.update(eventRef, { attendeeCount: increment(delta) });
    return { status, attendeeCount: (eventSnap.data().attendeeCount as number) + delta };
  });
}

/**
 * Ids of the given events the user is going to. RSVP docs carry no uid field (the id is the uid) and the
 * rules have no collection-group match, so this is one direct read per event.
 */
export async function listMyRsvpEventIds(uid: string, eventIds: string[]): Promise<string[]> {
  const statuses = await Promise.all(
    eventIds.map(async (eventId) => {
      const snap = await getDoc(doc(db, 'events', eventId, 'rsvps', uid));
      return snap.exists() && snap.data().status === 'going' ? eventId : null;
    }),
  );
  return statuses.filter((eventId): eventId is string => eventId !== null);
}

/** A few attendees (status "going") for the avatar preview. */
export async function listAttendees(eventId: string, max: number): Promise<PublicUser[]> {
  const snap = await getDocs(
    query(collection(db, 'events', eventId, 'rsvps'), where('status', '==', 'going'), limit(max)),
  );
  return Promise.all(snap.docs.map((rsvp) => getUser(rsvp.id)));
}
