// RSVP race tests against the Firestore emulator (real rules enforced): npm run test:emulator
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { resolveEmulatorTarget } from '../scripts/emulatorGuard.ts';
import { toggleRsvp } from '../src/services/rsvpService.ts';

setLogLevel('silent');

const EVENT_ID = 'evt-race';
const USERS = ['u1', 'u2', 'u3', 'u4', 'u5'];
let testEnv: RulesTestEnvironment;

const db = (uid: string) => testEnv.authenticatedContext(uid, { email: `${uid}@test.dev` }).firestore() as unknown as Firestore;

/** Ground truth read with rules off: the stored counter and the number of "going" RSVP docs. */
async function counts() {
  let result = { attendeeCount: -1, goingDocs: -1 };
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore() as unknown as Firestore;
    const event = await getDoc(doc(admin, 'events', EVENT_ID));
    const rsvps = await getDocs(collection(admin, 'events', EVENT_ID, 'rsvps'));
    result = {
      attendeeCount: event.data()?.attendeeCount as number,
      goingDocs: rsvps.docs.filter((rsvp) => rsvp.data().status === 'going').length,
    };
  });
  return result;
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
    for (const uid of USERS) {
      await setDoc(doc(admin, 'users', uid), { name: uid, email: `${uid}@test.dev`, role: 'attendee', avatarUrl: '' });
    }
    await setDoc(doc(admin, 'events', EVENT_ID), {
      title: 'Pitch Night: Seed Stage Edition',
      description: 'Eight startups, five minutes each.',
      date: Timestamp.fromDate(new Date('2026-10-15T18:00:00.000Z')),
      location: 'Innovation Hall, 1 University Avenue',
      category: 'Pitch Night',
      organizerId: 'organizer',
      attendeeCount: 0,
      commentCount: 0,
      imageUrl: '',
    });
  });
});

after(async () => {
  await testEnv.cleanup();
});

test('a single toggle joins, a second toggle leaves', async () => {
  assert.deepEqual(await toggleRsvp(db('u1'), EVENT_ID, 'u1'), { status: 'going', attendeeCount: 1 });
  assert.deepEqual(await toggleRsvp(db('u1'), EVENT_ID, 'u1'), { status: 'not_going', attendeeCount: 0 });
  assert.deepEqual(await counts(), { attendeeCount: 0, goingDocs: 0 });
});

test('two users RSVPing at the same moment both count', async () => {
  const results = await Promise.all([toggleRsvp(db('u1'), EVENT_ID, 'u1'), toggleRsvp(db('u2'), EVENT_ID, 'u2')]);

  assert.deepEqual(results.map((r) => r.status), ['going', 'going']);
  assert.deepEqual(await counts(), { attendeeCount: 2, goingDocs: 2 });
});

test('five users RSVPing at the same moment all count', async () => {
  await Promise.all(USERS.map((uid) => toggleRsvp(db(uid), EVENT_ID, uid)));

  assert.deepEqual(await counts(), { attendeeCount: USERS.length, goingDocs: USERS.length });
});

test('one user toggling from two devices at once never corrupts the count', async () => {
  const outcomes = await Promise.allSettled([toggleRsvp(db('u1'), EVENT_ID, 'u1'), toggleRsvp(db('u1'), EVENT_ID, 'u1')]);
  const statuses = outcomes.flatMap((o) => (o.status === 'fulfilled' ? [o.value.status] : [])).sort();
  const failures = outcomes.flatMap((o) => (o.status === 'rejected' ? [(o.reason as { code?: string }).code] : []));

  // Either the two toggles serialise (join, then leave), or the loser is refused because the RSVP doc it
  // read as missing was created underneath it. Never both "going" with a count of 2.
  if (failures.length === 0) {
    assert.deepEqual(statuses, ['going', 'not_going']);
    assert.deepEqual(await counts(), { attendeeCount: 0, goingDocs: 0 });
  } else {
    assert.deepEqual({ statuses, failures }, { statuses: ['going'], failures: ['permission-denied'] });
    assert.deepEqual(await counts(), { attendeeCount: 1, goingDocs: 1 });
  }
});

test('a naive read-then-write race is rejected by the rules instead of corrupting the count', async () => {
  const clients = ['u1', 'u2'].map((uid) => ({ uid, firestore: db(uid) }));
  // Both clients read attendeeCount = 0 before either writes: the classic lost-update setup.
  const snapshots = await Promise.all(clients.map(({ firestore }) => getDoc(doc(firestore, 'events', EVENT_ID))));

  const writes = clients.map(({ uid, firestore }, index) => {
    const batch = writeBatch(firestore);
    batch.set(doc(firestore, 'events', EVENT_ID, 'rsvps', uid), { status: 'going', updatedAt: serverTimestamp() });
    batch.update(doc(firestore, 'events', EVENT_ID), { attendeeCount: (snapshots[index].data()?.attendeeCount as number) + 1 });
    return batch.commit();
  });
  const outcomes = await Promise.allSettled(writes);

  // Without the rule both would "succeed" and the count would read 1 with 2 attendees.
  assert.equal(outcomes.filter((o) => o.status === 'fulfilled').length, 1);
  const rejected = outcomes.find((o): o is PromiseRejectedResult => o.status === 'rejected');
  assert.equal((rejected?.reason as { code?: string }).code, 'permission-denied');
  assert.deepEqual(await counts(), { attendeeCount: 1, goingDocs: 1 });
});
