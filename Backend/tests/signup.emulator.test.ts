// Runs against the Auth + Firestore emulators: npm run test:emulator
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, test } from 'node:test';
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc, setLogLevel } from 'firebase/firestore';
import { resolveEmulatorTarget } from '../scripts/emulatorGuard.ts';
import { signUp } from '../src/signUp.ts';

// Denied writes are the point of most tests; don't let the SDK log each one as a stream error.
setLogLevel('silent');

const target = resolveEmulatorTarget(process.env);
const PASSWORD = 'startup123';
const apps: FirebaseApp[] = [];

/** A fresh, isolated client (its own auth state), wired to the emulators exactly like the app will be. */
function newClient() {
  const app = initializeApp({ projectId: target.projectId, apiKey: 'demo-api-key' }, randomUUID());
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${target.authHost}`, { disableWarnings: true });
  const db = getFirestore(app);
  const firestore = new URL(`http://${target.firestoreHost}`);
  connectFirestoreEmulator(db, firestore.hostname, Number(firestore.port));
  return { auth, db };
}

const uniqueEmail = () => `signup-${randomUUID()}@test.dev`;
const isPermissionDenied = (error: unknown) => (error as { code?: string }).code === 'permission-denied';

after(async () => {
  await Promise.all(apps.map((app) => deleteApp(app)));
});

test('signUp creates the Auth account and a matching attendee profile', async () => {
  const { auth, db } = newClient();
  const email = uniqueEmail();

  const credential = await signUp(auth, db, { name: '  Ada Lovelace ', email: email.toUpperCase(), password: PASSWORD });
  const snapshot = await getDoc(doc(db, 'users', credential.user.uid));

  assert.equal(auth.currentUser?.uid, credential.user.uid);
  assert.ok(snapshot.exists());
  assert.deepEqual(snapshot.data(), { name: 'Ada Lovelace', email, role: 'attendee', avatarUrl: '' });
});

test('a tampered client cannot sign up as organizer or admin, or add extra fields', async () => {
  const { auth, db } = newClient();
  const email = uniqueEmail();
  const { user } = await createUserWithEmailAndPassword(auth, email, PASSWORD);
  const ref = doc(db, 'users', user.uid);
  const base = { name: 'Mallory', email, avatarUrl: '' };

  await assert.rejects(setDoc(ref, { ...base, role: 'admin' }), isPermissionDenied);
  await assert.rejects(setDoc(ref, { ...base, role: 'organizer' }), isPermissionDenied);
  await assert.rejects(setDoc(ref, { ...base, role: 'attendee', isAdmin: true }), isPermissionDenied);
  await assert.rejects(setDoc(ref, { name: 'Mallory', email, role: 'attendee' }), isPermissionDenied);
});

test('the profile email must be the account email and the name must be real', async () => {
  const { auth, db } = newClient();
  const { user } = await createUserWithEmailAndPassword(auth, uniqueEmail(), PASSWORD);
  const ref = doc(db, 'users', user.uid);

  await assert.rejects(setDoc(ref, { name: 'Eve', email: 'ceo@company.com', role: 'attendee', avatarUrl: '' }), isPermissionDenied);
  await assert.rejects(setDoc(ref, { name: '   ', email: user.email, role: 'attendee', avatarUrl: '' }), isPermissionDenied);
  await assert.rejects(setDoc(ref, { name: 'x'.repeat(81), email: user.email, role: 'attendee', avatarUrl: '' }), isPermissionDenied);
});

test('users cannot create a profile for another uid', async () => {
  const attacker = newClient();
  const { user } = await createUserWithEmailAndPassword(attacker.auth, uniqueEmail(), PASSWORD);
  const profile = { name: 'Attacker', email: user.email, role: 'attendee', avatarUrl: '' };

  await assert.rejects(setDoc(doc(attacker.db, 'users', 'someone-else'), profile), isPermissionDenied);
});

test('an existing profile (and its role) cannot be overwritten by signing up again', async () => {
  const { auth, db } = newClient();
  const { user } = await signUp(auth, db, { name: 'Grace', email: uniqueEmail(), password: PASSWORD });

  await assert.rejects(
    setDoc(doc(db, 'users', user.uid), { name: 'Grace', email: user.email, role: 'admin', avatarUrl: '' }),
    isPermissionDenied,
  );
});

test('signed-out clients cannot write profiles', async () => {
  const { auth, db } = newClient();
  const email = uniqueEmail();
  const { user } = await createUserWithEmailAndPassword(auth, email, PASSWORD);
  await signOut(auth);

  await assert.rejects(setDoc(doc(db, 'users', user.uid), { name: 'Ghost', email, role: 'attendee', avatarUrl: '' }), isPermissionDenied);
});

test('signUp removes the Auth account if the profile write is rejected', async () => {
  const { auth, db } = newClient();
  const email = uniqueEmail();

  await assert.rejects(signUp(auth, db, { name: '   ', email, password: PASSWORD }), isPermissionDenied);
  // The account was rolled back, so the same email can't sign in (and is free to sign up again).
  await assert.rejects(signInWithEmailAndPassword(auth, email, PASSWORD), (error: { code?: string }) =>
    ['auth/user-not-found', 'auth/invalid-credential'].includes(error.code ?? ''),
  );
});
