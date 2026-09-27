import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AppError } from './errors';
import { auth, db, USE_EMULATOR } from './firebase';
import type { User } from './types';
import { getProfile } from './usersService';

/** Seeded emulator organizer, shown as a hint on the Login screen. Never set against production. */
export const demoCredentials = USE_EMULATOR ? { email: 'maya@loopdesk.io', password: 'startup123' } : null;

/** Signs in and returns the account's profile. Expects a normalized email. */
export async function login(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getProfile(user.uid);
  if (!profile) {
    await signOut(auth);
    throw new AppError('This account has no profile. Please contact support.');
  }
  return profile;
}

/**
 * Signup contract (Backend/README "Signup contract"): create the Auth account, then immediately
 * create users/{uid} with role hardcoded to "attendee" — never from input; the rules reject anything
 * else. If the profile write fails, the Auth account is deleted so the email isn't stuck without a profile.
 */
export async function signup(name: string, email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = { name, email: credential.user.email ?? email, role: 'attendee' as const, avatarUrl: '' };
  try {
    await setDoc(doc(db, 'users', credential.user.uid), profile);
  } catch (error) {
    await deleteUser(credential.user).catch(() => undefined);
    throw error;
  }
  return { id: credential.user.uid, ...profile };
}

/** The signed-in user's uid, straight from Firebase Auth (the source of truth for identity). */
export function currentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function logout(): Promise<void> {
  return signOut(auth);
}

/** Fires on app start (restored session or null) and on every sign-in/out. Returns the unsubscribe. */
export function subscribeToAuth(onChange: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, onChange);
}
