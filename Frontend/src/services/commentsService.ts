import { request } from './api';
import { USE_MOCK_DATA } from './config';
import * as mock from './mockApi';
import type { CommentWithAuthor } from './types';

/** GET /events/:id/comments → newest first, author embedded. */
export function listComments(eventId: string): Promise<CommentWithAuthor[]> {
  return USE_MOCK_DATA
    ? mock.listComments(eventId)
    : request<CommentWithAuthor[]>({ method: 'GET', url: `/events/${encodeURIComponent(eventId)}/comments` });
}

/** POST /events/:id/comments { body } → the created comment. The server sets the author from the token. */
export function createComment(eventId: string, body: string): Promise<CommentWithAuthor> {
  return USE_MOCK_DATA
    ? mock.createComment(eventId, body)
    : request<CommentWithAuthor>({
        method: 'POST',
        url: `/events/${encodeURIComponent(eventId)}/comments`,
        data: { body },
      });
}
