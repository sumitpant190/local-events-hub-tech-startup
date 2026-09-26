// Security rules tests against the Firestore emulator: npm run test:emulator
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { resolveEmulatorTarget } from '../scripts/emulatorGuard.ts';
import type { UserRole } from '../src/types.ts';

// Denied writes are expected in most tests; don't log each one as a stream error.
setLogLevel('silent');

const EVENT = 'events/evt-1';
let testEnv: RulesTestEnvironment;

const profile = (uid: string, role: UserRole) => ({ name: uid, email: `${uid}@test.dev`, role, avatarUrl: '' });

const eventData = (organizerId: string) => ({
  title: 'Build Weekend: 48h AI Hackathon',
  description: 'Ship an AI prototype in a weekend.',
  date: Timestamp.fromDate(new Date('2026-10-09T17:00:00.000Z')),
  location: 'The Foundry Co-working, 12 Market Street',
  category: 'Hackathon',
  organizerId,
  attendeeCount: 0,
  commentCount: 0,
  imageUrl: '',
});

/** A client signed in as `uid` (with a matching email claim), or signed out when uid is omitted. */
function db(uid?: string): Firestore {
  const context = uid
    ? testEnv.authenticatedContext(uid, { email: `${uid}@test.dev` })
    : testEnv.unauthenticatedContext();
  return context.firestore() as unknown as Firestore;
}

before(async () => {
  const target = resolveEmulatorTarget(process.env);
  const host = new URL(`http://${target.firestoreHost}`);
  testEnv = await initializeTestEnvironment({
    projectId: target.projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: host.hostname, port: Number(host.port) },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore() as unknown as Firestore;
    for (const [uid, role] of [
      ['alice', 'attendee'],
      ['bob', 'attendee'],
      ['olivia', 'organizer'],
      ['oscar', 'organizer'],
      ['adam', 'admin'],
    ] as const) {
      await setDoc(doc(admin, 'users', uid), profile(uid, role));
    }
    // Two "going" RSVPs below, so the counter starts at 2.
    await setDoc(doc(admin, EVENT), { ...eventData('olivia'), attendeeCount: 2 });
    await setDoc(doc(admin, EVENT, 'rsvps', 'alice'), { status: 'going', updatedAt: serverTimestamp() });
    await setDoc(doc(admin, EVENT, 'rsvps', 'bob'), { status: 'going', updatedAt: serverTimestamp() });
    await setDoc(doc(admin, EVENT, 'comments', 'c-alice'), { userId: 'alice', text: 'See you there', createdAt: serverTimestamp() });
    await setDoc(doc(admin, EVENT, 'comments', 'c-bob'), { userId: 'bob', text: 'Can not wait', createdAt: serverTimestamp() });
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('users: role spoofing (self-promotion)', () => {
  test('CANNOT sign up as organizer', async () => {
    await assertFails(setDoc(doc(db('newbie'), 'users/newbie'), profile('newbie', 'organizer')));
  });

  test('CANNOT sign up as admin', async () => {
    await assertFails(setDoc(doc(db('newbie'), 'users/newbie'), profile('newbie', 'admin')));
  });

  test('CANNOT update own role to organizer (partial update)', async () => {
    await assertFails(updateDoc(doc(db('alice'), 'users/alice'), { role: 'organizer' }));
  });

  test('CANNOT update own role to admin (full overwrite)', async () => {
    await assertFails(setDoc(doc(db('alice'), 'users/alice'), profile('alice', 'admin')));
  });

  test('CANNOT smuggle a role change alongside a legitimate name change', async () => {
    await assertFails(updateDoc(doc(db('alice'), 'users/alice'), { name: 'Alice', role: 'organizer' }));
  });

  test('an organizer CANNOT promote themselves to admin', async () => {
    await assertFails(updateDoc(doc(db('olivia'), 'users/olivia'), { role: 'admin' }));
  });

  test('an organizer CANNOT promote someone else', async () => {
    await assertFails(updateDoc(doc(db('olivia'), 'users/alice'), { role: 'organizer' }));
  });
});

describe('users: other access', () => {
  test('CAN create own attendee doc', async () => {
    await assertSucceeds(setDoc(doc(db('newbie'), 'users/newbie'), profile('newbie', 'attendee')));
  });

  test('CAN edit own name and avatar', async () => {
    await assertSucceeds(updateDoc(doc(db('alice'), 'users/alice'), { name: 'Alice Doe', avatarUrl: 'https://example.com/a.png' }));
  });

  test('CAN read another profile when signed in', async () => {
    await assertSucceeds(getDoc(doc(db('alice'), 'users/bob')));
  });

  test('an admin CAN promote a user to organizer', async () => {
    await assertSucceeds(updateDoc(doc(db('adam'), 'users/alice'), { role: 'organizer' }));
  });

  test('CANNOT create a doc for another uid', async () => {
    await assertFails(setDoc(doc(db('newbie'), 'users/someone-else'), profile('newbie', 'attendee')));
  });

  test('CANNOT sign up with an email that is not the account email', async () => {
    await assertFails(setDoc(doc(db('newbie'), 'users/newbie'), { ...profile('newbie', 'attendee'), email: 'ceo@company.com' }));
  });

  test("CANNOT edit someone else's profile", async () => {
    await assertFails(updateDoc(doc(db('alice'), 'users/bob'), { name: 'Hacked' }));
  });

  test('CANNOT add extra fields to own profile', async () => {
    await assertFails(updateDoc(doc(db('alice'), 'users/alice'), { isAdmin: true }));
  });

  test('CANNOT change own email', async () => {
    await assertFails(updateDoc(doc(db('alice'), 'users/alice'), { email: 'bob@test.dev' }));
  });

  test('CANNOT delete a profile', async () => {
    await assertFails(deleteDoc(doc(db('alice'), 'users/alice')));
  });

  test('CANNOT read profiles when signed out', async () => {
    await assertFails(getDoc(doc(db(), 'users/alice')));
  });
});

describe('events', () => {
  test('CAN read events when signed in', async () => {
    await assertSucceeds(getDocs(collection(db('alice'), 'events')));
  });

  test('an organizer CAN create an event as themselves', async () => {
    await assertSucceeds(setDoc(doc(db('oscar'), 'events/evt-new'), eventData('oscar')));
  });

  test('an organizer CAN edit and delete their own event', async () => {
    await assertSucceeds(updateDoc(doc(db('olivia'), EVENT), { title: 'Build Weekend 2026' }));
    await assertSucceeds(deleteDoc(doc(db('olivia'), EVENT)));
  });

  test("an admin CAN edit and delete someone else's event", async () => {
    await assertSucceeds(updateDoc(doc(db('adam'), EVENT), { title: 'Moderated title' }));
    await assertSucceeds(deleteDoc(doc(db('adam'), EVENT)));
  });

  test('CANNOT read events when signed out', async () => {
    await assertFails(getDoc(doc(db(), EVENT)));
  });

  test('an attendee CANNOT create an event', async () => {
    await assertFails(setDoc(doc(db('alice'), 'events/evt-new'), eventData('alice')));
  });

  test('a demoted organizer CANNOT create an event', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore() as unknown as Firestore, 'users/oscar'), { role: 'attendee' });
    });
    await assertFails(setDoc(doc(db('oscar'), 'events/evt-new'), eventData('oscar')));
  });

  test('an organizer CANNOT create an event under another organizerId', async () => {
    await assertFails(setDoc(doc(db('oscar'), 'events/evt-new'), eventData('olivia')));
  });

  test('an organizer CANNOT create an event with inflated counters', async () => {
    await assertFails(setDoc(doc(db('oscar'), 'events/evt-new'), { ...eventData('oscar'), attendeeCount: 500 }));
  });

  test('an organizer CANNOT create an invalid event', async () => {
    await assertFails(setDoc(doc(db('oscar'), 'events/evt-new'), { ...eventData('oscar'), category: 'Party' }));
    await assertFails(setDoc(doc(db('oscar'), 'events/evt-new'), { ...eventData('oscar'), featured: true }));
  });

  test("an organizer CANNOT edit or delete another organizer's event", async () => {
    await assertFails(updateDoc(doc(db('oscar'), EVENT), { title: 'Hijacked' }));
    await assertFails(deleteDoc(doc(db('oscar'), EVENT)));
  });

  test('an organizer CANNOT hand their event to someone else', async () => {
    await assertFails(updateDoc(doc(db('olivia'), EVENT), { organizerId: 'oscar' }));
  });

  test("an organizer CANNOT edit their own event's counters", async () => {
    await assertFails(updateDoc(doc(db('olivia'), EVENT), { attendeeCount: 999 }));
    await assertFails(updateDoc(doc(db('olivia'), EVENT), { commentCount: 999 }));
  });

  test('an attendee CANNOT edit or delete an event', async () => {
    await assertFails(updateDoc(doc(db('alice'), EVENT), { title: 'Hacked' }));
    await assertFails(deleteDoc(doc(db('alice'), EVENT)));
  });
});

describe('rsvps', () => {
  const going = { status: 'going', updatedAt: serverTimestamp() };
  const notGoing = { status: 'not_going', updatedAt: serverTimestamp() };

  /** Writes rsvps/{rsvpId} as `uid`, plus (optionally) the event fields in the same atomic commit. */
  function commitRsvp(uid: string, rsvpId: string, rsvp: object, eventUpdate?: object) {
    const firestore = db(uid);
    const batch = writeBatch(firestore);
    batch.set(doc(firestore, EVENT, 'rsvps', rsvpId), rsvp);
    if (eventUpdate) batch.update(doc(firestore, EVENT), eventUpdate);
    return batch.commit();
  }

  test('CAN RSVP for themselves (with the +1 in the same commit)', async () => {
    await assertSucceeds(commitRsvp('oscar', 'oscar', going, { attendeeCount: 3 }));
  });

  test('CAN change their own RSVP to not_going (with the -1 in the same commit)', async () => {
    await assertSucceeds(commitRsvp('alice', 'alice', notGoing, { attendeeCount: 1 }));
  });

  test('CAN re-save an unchanged RSVP without touching the count', async () => {
    await assertSucceeds(commitRsvp('alice', 'alice', going));
  });

  test('CAN read RSVPs when signed in', async () => {
    await assertSucceeds(getDocs(collection(db('alice'), EVENT, 'rsvps')));
  });

  test('CANNOT RSVP as someone else', async () => {
    await assertFails(commitRsvp('alice', 'oscar', going, { attendeeCount: 3 }));
  });

  test("CANNOT change someone else's RSVP", async () => {
    await assertFails(commitRsvp('alice', 'bob', notGoing, { attendeeCount: 1 }));
  });

  test('CANNOT use an invalid status or extra fields', async () => {
    await assertFails(commitRsvp('oscar', 'oscar', { status: 'maybe', updatedAt: serverTimestamp() }));
    await assertFails(commitRsvp('oscar', 'oscar', { ...going, plusOnes: 5 }, { attendeeCount: 3 }));
  });

  test('CANNOT backdate updatedAt instead of using the server time', async () => {
    await assertFails(commitRsvp('oscar', 'oscar', { status: 'going', updatedAt: Timestamp.fromDate(new Date('2020-01-01')) }, { attendeeCount: 3 }));
  });

  test('CANNOT RSVP going without the matching +1 on attendeeCount', async () => {
    await assertFails(commitRsvp('oscar', 'oscar', going));
  });

  test('CANNOT cancel without the matching -1 on attendeeCount', async () => {
    await assertFails(commitRsvp('alice', 'alice', notGoing));
  });

  test('CANNOT change attendeeCount without an RSVP change', async () => {
    await assertFails(updateDoc(doc(db('alice'), EVENT), { attendeeCount: 3 }));
    await assertFails(updateDoc(doc(db('oscar'), EVENT), { attendeeCount: 3 }));
  });

  test('CANNOT move attendeeCount by more than one, or the wrong way', async () => {
    await assertFails(commitRsvp('oscar', 'oscar', going, { attendeeCount: 4 }));
    await assertFails(commitRsvp('oscar', 'oscar', going, { attendeeCount: 1 }));
    await assertFails(commitRsvp('alice', 'alice', notGoing, { attendeeCount: 3 }));
  });

  test('CANNOT change other event fields alongside the counter', async () => {
    await assertFails(commitRsvp('oscar', 'oscar', going, { attendeeCount: 3, title: 'Hijacked' }));
    await assertFails(commitRsvp('oscar', 'oscar', going, { attendeeCount: 3, commentCount: 50 }));
  });

  test('CANNOT RSVP to an event that does not exist', async () => {
    await assertFails(setDoc(doc(db('oscar'), 'events/ghost/rsvps/oscar'), { status: 'going', updatedAt: serverTimestamp() }));
  });

  test('CANNOT delete an RSVP (cancel with not_going instead)', async () => {
    await assertFails(deleteDoc(doc(db('alice'), EVENT, 'rsvps', 'alice')));
  });

  test('CANNOT RSVP when signed out', async () => {
    await assertFails(setDoc(doc(db(), EVENT, 'rsvps', 'oscar'), going));
  });
});

describe('comments', () => {
  const comment = (userId: string, text = 'Looking forward to it!') => ({ userId, text, createdAt: serverTimestamp() });

  test('CAN post a comment as themselves', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), EVENT, 'comments', 'c-new'), comment('alice')));
  });

  test('CAN post a 499-character comment', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), EVENT, 'comments', 'c-new'), comment('alice', 'x'.repeat(499))));
  });

  test('CAN read comments when signed in', async () => {
    await assertSucceeds(getDocs(collection(db('bob'), EVENT, 'comments')));
  });

  test('CAN delete their own comment, and an admin CAN delete anyone’s', async () => {
    await assertSucceeds(deleteDoc(doc(db('alice'), EVENT, 'comments', 'c-alice')));
    await assertSucceeds(deleteDoc(doc(db('adam'), EVENT, 'comments', 'c-bob')));
  });

  test('CANNOT post as someone else', async () => {
    await assertFails(setDoc(doc(db('alice'), EVENT, 'comments', 'c-new'), comment('bob')));
  });

  test('CANNOT post empty, whitespace-only or 500+ character text', async () => {
    const ref = doc(db('alice'), EVENT, 'comments', 'c-new');
    await assertFails(setDoc(ref, comment('alice', '')));
    await assertFails(setDoc(ref, comment('alice', '   \n ')));
    await assertFails(setDoc(ref, comment('alice', 'x'.repeat(500))));
    await assertFails(setDoc(ref, { userId: 'alice', text: 42, createdAt: serverTimestamp() }));
  });

  test('CANNOT backdate createdAt or add extra fields', async () => {
    const ref = doc(db('alice'), EVENT, 'comments', 'c-new');
    await assertFails(setDoc(ref, { ...comment('alice'), createdAt: Timestamp.fromDate(new Date('2020-01-01')) }));
    await assertFails(setDoc(ref, { ...comment('alice'), pinned: true }));
  });

  test("CANNOT edit someone else's comment", async () => {
    await assertFails(updateDoc(doc(db('alice'), EVENT, 'comments', 'c-bob'), { text: 'Edited by alice' }));
  });

  test('CANNOT edit their own comment (comments are immutable)', async () => {
    await assertFails(updateDoc(doc(db('alice'), EVENT, 'comments', 'c-alice'), { text: 'Edited' }));
  });

  test("CANNOT delete someone else's comment (not even the event organizer)", async () => {
    await assertFails(deleteDoc(doc(db('alice'), EVENT, 'comments', 'c-bob')));
    await assertFails(deleteDoc(doc(db('olivia'), EVENT, 'comments', 'c-bob')));
  });

  test('CANNOT comment on an event that does not exist', async () => {
    await assertFails(setDoc(doc(db('alice'), 'events/ghost/comments/c-new'), comment('alice')));
  });

  test('CANNOT comment when signed out', async () => {
    await assertFails(setDoc(doc(db(), EVENT, 'comments', 'c-new'), comment('alice')));
  });
});

describe('everything else', () => {
  test('unknown collections are denied', async () => {
    await assertFails(setDoc(doc(db('adam'), 'admin/config'), { open: true }));
    await assertFails(getDoc(doc(db('adam'), 'admin/config')));
  });
});
