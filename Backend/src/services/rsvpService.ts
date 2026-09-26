// Reference RSVP toggle for the React Native app (see README "RSVP"). Import or copy as-is.
import { doc, increment, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { RsvpStatus } from '../types.ts';

export interface RsvpResult {
  status: RsvpStatus;
  attendeeCount: number;
}

/**
 * Flips the caller's RSVP for an event (going <-> not_going) and moves attendeeCount by exactly +1/-1,
 * atomically. Must run as `uid` (the signed-in user): the rules reject any other RSVP doc.
 *
 * A transaction, not read-then-write: if another device changes the event or this RSVP between our
 * reads and our commit, Firestore rejects the commit and re-runs this function on fresh data.
 *
 * The count is written as increment(+/-1), applied by the server to the value it holds at commit, not as
 * "the number I read + 1". The rules compare the new count against the stored one, so an absolute value
 * computed from a read that another RSVP has since overtaken is refused (permission-denied, which the SDK
 * does not retry); increment() can't go stale.
 */
export async function toggleRsvp(db: Firestore, eventId: string, uid: string): Promise<RsvpResult> {
  const eventRef = doc(db, 'events', eventId);
  const rsvpRef = doc(db, 'events', eventId, 'rsvps', uid);

  return runTransaction(db, async (transaction) => {
    // All reads before any write (a Firestore transaction requirement).
    const [eventSnap, rsvpSnap] = await Promise.all([transaction.get(eventRef), transaction.get(rsvpRef)]);
    if (!eventSnap.exists()) throw new Error('This event no longer exists.');

    const wasGoing = rsvpSnap.exists() && rsvpSnap.data().status === 'going';
    const status: RsvpStatus = wasGoing ? 'not_going' : 'going';
    const delta = wasGoing ? -1 : 1;

    transaction.set(rsvpRef, { status, updatedAt: serverTimestamp() });
    transaction.update(eventRef, { attendeeCount: increment(delta) });
    // The count this transaction committed on top of (a stale read makes the commit retry).
    return { status, attendeeCount: (eventSnap.data().attendeeCount as number) + delta };
  });
}
