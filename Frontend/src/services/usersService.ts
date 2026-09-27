import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { PublicUser, User, UserRole } from './types';

interface UserDoc {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

// Profiles change rarely and are read for every comment author and attendee face; cache per session.
const publicUserCache = new Map<string, Promise<PublicUser>>();

/** users/{uid}, or null when the account has no profile document. */
export async function getProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserDoc;
  return { id: snap.id, name: data.name, email: data.email, role: data.role, avatarUrl: data.avatarUrl };
}

/** Name and avatar for display. A missing profile resolves to a placeholder instead of failing the list. */
export function getUser(uid: string): Promise<PublicUser> {
  const cached = publicUserCache.get(uid);
  if (cached) return cached;
  const request = getProfile(uid)
    .then((user) => (user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : { id: uid, name: 'Former member', avatarUrl: '' }))
    .catch((error: unknown) => {
      publicUserCache.delete(uid); // Retry next time instead of caching a network failure.
      throw error;
    });
  publicUserCache.set(uid, request);
  return request;
}

/** The rules let users change only their own name and avatarUrl. */
export async function updateMyName(uid: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { name });
  publicUserCache.delete(uid);
}

export function clearUserCache(): void {
  publicUserCache.clear();
}
