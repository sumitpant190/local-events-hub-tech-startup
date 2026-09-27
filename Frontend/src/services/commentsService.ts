import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { AppError } from './errors';
import { db } from './firebase';
import type { CommentWithAuthor, EventComment } from './types';
import { getUser } from './usersService';

/**
 * Live comments for an event, newest first, with authors resolved. Firestore pushes every add/delete,
 * so there's no polling or refresh. Returns the unsubscribe: callers MUST call it on unmount.
 */
export function subscribeToComments(
  eventId: string,
  onChange: (comments: CommentWithAuthor[]) => void,
  onError: (error: unknown) => void,
): () => void {
  let latest = 0; // Author lookups are async; drop results from snapshots that have since been superseded.

  return onSnapshot(
    query(collection(db, 'events', eventId, 'comments'), orderBy('createdAt', 'desc')),
    (snap) => {
      const version = ++latest;
      // 'estimate' fills createdAt for a just-committed comment until the server time arrives.
      const comments: EventComment[] = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return { id: d.id, userId: data.userId as string, text: data.text as string, createdAt: data.createdAt as Timestamp };
      });
      Promise.all(comments.map(async (comment) => ({ ...comment, author: await getUser(comment.userId) })))
        .then((withAuthors) => version === latest && onChange(withAuthors))
        .catch((error: unknown) => version === latest && onError(error));
    },
    onError,
  );
}

/**
 * Creates the comment and increments the event's commentCount in one transaction (mirrors
 * Backend/src/services/commentService.ts). The rules refuse a comment without the matching +1.
 */
export async function addComment(eventId: string, uid: string, text: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  const commentRef = doc(collection(db, 'events', eventId, 'comments'));

  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists()) throw new AppError('This event no longer exists.');

    transaction.set(commentRef, { userId: uid, text, createdAt: serverTimestamp() });
    transaction.update(eventRef, { commentCount: increment(1) });
  });
}
