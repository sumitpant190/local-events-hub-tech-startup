// Reference comment writes for the React Native app (see README "Comments"). Import or copy as-is.
// Reading is just onSnapshot on events/{eventId}/comments: Firestore pushes new comments, no server needed.
import { collection, doc, increment, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';

/**
 * Posts a comment as `uid` and bumps the event's commentCount by 1 in the same transaction, so the count
 * can't drift from the real number of comments (there is no server trigger on Spark to fix it later).
 * Same technique as toggleRsvp: increment() is applied server-side at commit, so concurrent posters never
 * overwrite each other's +1. Returns the new comment's id.
 */
export async function addComment(db: Firestore, eventId: string, uid: string, text: string): Promise<string> {
  const eventRef = doc(db, 'events', eventId);
  const commentRef = doc(collection(db, 'events', eventId, 'comments'));

  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists()) throw new Error('This event no longer exists.');

    transaction.set(commentRef, { userId: uid, text: text.trim(), createdAt: serverTimestamp() });
    transaction.update(eventRef, { commentCount: increment(1) });
  });
  return commentRef.id;
}

/**
 * Deletes a comment (author or admin) and decrements commentCount in the same transaction. Reading the
 * comment first means a double tap (or two devices) can't decrement twice: the second run finds it gone.
 */
export async function deleteComment(db: Firestore, eventId: string, commentId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  const commentRef = doc(db, 'events', eventId, 'comments', commentId);

  await runTransaction(db, async (transaction) => {
    const commentSnap = await transaction.get(commentRef);
    if (!commentSnap.exists()) throw new Error('This comment was already deleted.');

    transaction.delete(commentRef);
    transaction.update(eventRef, { commentCount: increment(-1) });
  });
}
