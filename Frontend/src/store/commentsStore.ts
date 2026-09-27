import { create } from 'zustand';
import { currentUid } from '../services/authService';
import * as commentsService from '../services/commentsService';
import { getErrorMessage } from '../services/errors';
import type { CommentWithAuthor } from '../services/types';
import { sanitizeComment } from '../utils/sanitize';

export type CommentResult = { ok: true } | { ok: false; error: string };

interface CommentsState {
  /** Newest first, keyed by event id. Kept live by the Firestore listener while the event is open. */
  commentsByEvent: Record<string, CommentWithAuthor[]>;
  loadErrorByEvent: Record<string, string>;
  postingEventId: string | null;
  /** Starts the live listener for an event. Returns the unsubscribe: call it on unmount. */
  subscribe: (eventId: string) => () => void;
  addComment: (eventId: string, rawText: string) => Promise<CommentResult>;
}

export const useCommentsStore = create<CommentsState>()((set, get) => ({
  commentsByEvent: {},
  loadErrorByEvent: {},
  postingEventId: null,

  subscribe: (eventId) =>
    commentsService.subscribeToComments(
      eventId,
      (comments) =>
        set((state) => {
          const { [eventId]: _cleared, ...otherErrors } = state.loadErrorByEvent;
          return { commentsByEvent: { ...state.commentsByEvent, [eventId]: comments }, loadErrorByEvent: otherErrors };
        }),
      (error) =>
        set((state) => ({
          loadErrorByEvent: { ...state.loadErrorByEvent, [eventId]: getErrorMessage(error, "Couldn't load comments.") },
        })),
    ),

  addComment: async (eventId, rawText) => {
    if (get().postingEventId === eventId) return { ok: false, error: 'Still posting your last comment.' };
    const uid = currentUid();
    if (!uid) return { ok: false, error: 'Log in to comment.' };
    // Sanitized for instant feedback; the rules independently enforce non-blank text under 500 characters.
    const text = sanitizeComment(rawText);
    if (!text) return { ok: false, error: "Comment can't be empty." };

    set({ postingEventId: eventId });
    try {
      // No local insert: the listener delivers the new comment as soon as the transaction commits.
      await commentsService.addComment(eventId, uid, text);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, "Couldn't post your comment. Please try again.") };
    } finally {
      set({ postingEventId: null });
    }
  },
}));
