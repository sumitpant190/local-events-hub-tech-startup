// Comment + commentCount tests against the Firestore emulator (real rules enforced): npm run test:emulator
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  setLogLevel,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { resolveEmulatorTarget } from '../scripts/emulatorGuard.ts';
import { addComment, deleteComment } from '../src/services/commentService.ts';

setLogLevel('silent');

const EVENT_ID = 'evt-talk';
const USERS = ['u1', 'u2', 'u3', 'u4', 'u5'];
let testEnv: RulesTestEnvironment;

const db = (uid: string) => testEnv.authenticatedContext(uid, { email: `${uid}@test.dev` }).firestore() as unknown as Firestore;

/** Ground truth read with rules off: the stored counter and the real number of comment docs. */
async function counts() {
  let result = { commentCount: -1, commentDocs: -1 };
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore() as unknown as Firestore;
    const event = await getDoc(doc(admin, 'events', EVENT_ID));
    const comments = await getDocs(collection(admin, 'events', EVENT_ID, 'comments'));
    result = { commentCount: event.data()?.commentCount as number, commentDocs: comments.size };
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
      title: 'Founder Fireside',
      description: 'Q&A with three founders.',
      date: Timestamp.fromDate(new Date('2026-11-02T18:00:00.000Z')),
      location: 'Innovation Hall, 1 University Avenue',
      category: 'Panel',
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

test('posting a comment adds the doc and bumps commentCount; deleting it undoes both', async () => {
  const commentId = await addComment(db('u1'), EVENT_ID, 'u1', '  See you there  ');
  assert.deepEqual(await counts(), { commentCount: 1, commentDocs: 1 });

  const saved = await getDoc(doc(db('u2'), 'events', EVENT_ID, 'comments', commentId));
  assert.equal(saved.data()?.text, 'See you there');
  assert.equal(saved.data()?.userId, 'u1');

  await deleteComment(db('u1'), EVENT_ID, commentId);
  assert.deepEqual(await counts(), { commentCount: 0, commentDocs: 0 });
});

test('five users commenting at the same moment all count', async () => {
  await Promise.all(USERS.map((uid) => addComment(db(uid), EVENT_ID, uid, `Hi from ${uid}`)));

  assert.deepEqual(await counts(), { commentCount: USERS.length, commentDocs: USERS.length });
});

test('deleting the same comment from two devices at once decrements only once', async () => {
  const commentId = await addComment(db('u1'), EVENT_ID, 'u1', 'Double tap');
  const outcomes = await Promise.allSettled([
    deleteComment(db('u1'), EVENT_ID, commentId),
    deleteComment(db('u1'), EVENT_ID, commentId),
  ]);

  assert.equal(outcomes.filter((o) => o.status === 'fulfilled').length, 1);
  assert.deepEqual(await counts(), { commentCount: 0, commentDocs: 0 });
});

test("a user CANNOT delete someone else's comment through the service", async () => {
  const commentId = await addComment(db('u1'), EVENT_ID, 'u1', 'Mine');

  await assert.rejects(deleteComment(db('u2'), EVENT_ID, commentId), { code: 'permission-denied' });
  assert.deepEqual(await counts(), { commentCount: 1, commentDocs: 1 });
});

test('an onSnapshot listener receives comments posted by another user (real-time, no server)', async () => {
  const commentsQuery = query(collection(db('u2'), 'events', EVENT_ID, 'comments'), orderBy('createdAt', 'desc'));
  let unsubscribe = () => {};
  const received = new Promise<string[]>((resolve, reject) => {
    unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        if (snapshot.size > 0) resolve(snapshot.docs.map((d) => d.data().text as string));
      },
      reject,
    );
  });

  await addComment(db('u1'), EVENT_ID, 'u1', 'Live!');
  try {
    assert.deepEqual(await received, ['Live!']);
  } finally {
    unsubscribe();
  }
});
