import { create } from 'zustand';
import { getEventComments, postComment } from '../services/mockApi';
import type { EventComment, User } from '../services/types';
import { sanitizeComment } from '../utils/sanitize';

export type CommentResult = { ok: true } | { ok: false; error: string };

interface CommentsState {
  /** Newest first, keyed by event id. Absent until loadComments runs for that event. */
  commentsByEvent: Record<string, EventComment[]>;
  postingEventId: string | null;
  loadComments: (eventId: string) => void;
  addComment: (eventId: string, author: User, rawBody: string) => Promise<CommentResult>;
}

export const useCommentsStore = create<CommentsState>()((set, get) => ({
  commentsByEvent: {},
  postingEventId: null,

  loadComments: (eventId) => {
    if (get().commentsByEvent[eventId]) return;
    const newestFirst = [...getEventComments(eventId)].reverse();
    set((state) => ({ commentsByEvent: { ...state.commentsByEvent, [eventId]: newestFirst } }));
  },

  addComment: async (eventId, author, rawBody) => {
    if (get().postingEventId === eventId) return { ok: false, error: 'Still posting your last comment.' };
    const body = sanitizeComment(rawBody);
    if (!body) return { ok: false, error: "Comment can't be empty." };

    set({ postingEventId: eventId });
    try {
      const comment = await postComment(eventId, author.id, body);
      set((state) => ({
        commentsByEvent: {
          ...state.commentsByEvent,
          [eventId]: [comment, ...(state.commentsByEvent[eventId] ?? [])],
        },
      }));
      return { ok: true };
    } catch {
      return { ok: false, error: "Couldn't post your comment. Please try again." };
    } finally {
      set({ postingEventId: null });
    }
  },
}));
