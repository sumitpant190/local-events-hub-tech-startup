import { create } from 'zustand';
import { getErrorMessage } from '../services/api';
import * as commentsService from '../services/commentsService';
import type { CommentWithAuthor } from '../services/types';
import { sanitizeComment } from '../utils/sanitize';

export type CommentResult = { ok: true } | { ok: false; error: string };

interface CommentsState {
  /** Newest first, keyed by event id. Absent until loadComments succeeds for that event. */
  commentsByEvent: Record<string, CommentWithAuthor[]>;
  loadErrorByEvent: Record<string, string>;
  postingEventId: string | null;
  loadComments: (eventId: string) => Promise<void>;
  /** The server sets the author from the session token, so none is passed here. */
  addComment: (eventId: string, rawBody: string) => Promise<CommentResult>;
}

export const useCommentsStore = create<CommentsState>()((set, get) => ({
  commentsByEvent: {},
  loadErrorByEvent: {},
  postingEventId: null,

  loadComments: async (eventId) => {
    if (get().commentsByEvent[eventId]) return;
    try {
      const comments = await commentsService.listComments(eventId);
      set((state) => {
        const { [eventId]: _cleared, ...otherErrors } = state.loadErrorByEvent;
        return { commentsByEvent: { ...state.commentsByEvent, [eventId]: comments }, loadErrorByEvent: otherErrors };
      });
    } catch (error) {
      set((state) => ({
        loadErrorByEvent: { ...state.loadErrorByEvent, [eventId]: getErrorMessage(error, "Couldn't load comments.") },
      }));
    }
  },

  addComment: async (eventId, rawBody) => {
    if (get().postingEventId === eventId) return { ok: false, error: 'Still posting your last comment.' };
    // Sanitized here for instant feedback; the server sanitizes again and is the real authority.
    const body = sanitizeComment(rawBody);
    if (!body) return { ok: false, error: "Comment can't be empty." };

    set({ postingEventId: eventId });
    try {
      const comment = await commentsService.createComment(eventId, body);
      set((state) => ({
        commentsByEvent: {
          ...state.commentsByEvent,
          [eventId]: [comment, ...(state.commentsByEvent[eventId] ?? [])],
        },
      }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, "Couldn't post your comment. Please try again.") };
    } finally {
      set({ postingEventId: null });
    }
  },
}));
