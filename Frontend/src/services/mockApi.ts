import { sanitizeComment } from '../utils/sanitize';
import { adjustAttendeeCount, isEventFull } from '../utils/rsvp';
import { ApiError, getAuthToken } from './api';
import { mockComments } from './mockData/comments';
import { mockEvents } from './mockData/events';
import { mockUsers } from './mockData/users';
import type { AuthSession, CommentWithAuthor, EventComment, EventItem, PublicUser, RsvpStatus, User } from './types';

// In-memory stand-in for the backend. Each export mirrors one REST endpoint and returns the same
// shape the real API will, so the services can switch between them with USE_MOCK_DATA.
// All state resets when the app restarts.

// Long enough for the skeleton shimmer to register, short enough not to annoy.
const LIST_LATENCY_MS = 1000;
const WRITE_LATENCY_MS = 400;
const READ_LATENCY_MS = 250;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mock credentials: plaintext and in memory only. The real backend stores hashed passwords.
export const DEMO_PASSWORD = 'startup123';
export const DEMO_USER_EMAIL = mockUsers[0].email;

interface MockAccount {
  user: User;
  password: string;
}

let accounts: MockAccount[] = mockUsers.map((user) => ({ user, password: DEMO_PASSWORD }));
let events: EventItem[] = [...mockEvents];
let comments: EventComment[] = [...mockComments];
/** One `userId:eventId` key per RSVP, so RSVPs belong to accounts, not to the device. */
let rsvpKeys: ReadonlySet<string> = new Set();

const rsvpKey = (userId: string, eventId: string) => `${userId}:${eventId}`;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const toPublicUser = ({ id, name, headline }: User): PublicUser => ({ id, name, headline });
const findAccount = (userId: string | undefined) => accounts.find((entry) => entry.user.id === userId);

// Mock tokens are `mock.<userId>.<random>`; the real backend issues and verifies signed JWTs.
function issueToken(userId: string): string {
  return `mock.${userId}.${Math.random().toString(36).slice(2)}`;
}

function requireSessionUser(): User {
  const account = findAccount(getAuthToken()?.split('.')[1]);
  if (!account) throw new ApiError('Your session has expired. Please log in again.', 401);
  return account.user;
}

function requireEvent(eventId: string): EventItem {
  const event = events.find((item) => item.id === eventId);
  if (!event) throw new ApiError('Event not found.', 404);
  return event;
}

function withAuthor(comment: EventComment): CommentWithAuthor {
  const author = findAccount(comment.userId)?.user;
  return {
    ...comment,
    author: author ? toPublicUser(author) : { id: comment.userId, name: 'Former member', headline: '' },
  };
}

/** POST /auth/login. Expects a normalized email. */
export async function login(email: string, password: string): Promise<AuthSession> {
  await delay(WRITE_LATENCY_MS);
  const account = accounts.find((entry) => entry.user.email === email);
  if (!account || account.password !== password) throw new ApiError('Incorrect email or password.', 401);
  return { token: issueToken(account.user.id), user: account.user };
}

/** POST /auth/signup. Expects validated, normalized input. */
export async function signup(name: string, email: string, password: string): Promise<AuthSession> {
  await delay(WRITE_LATENCY_MS);
  if (accounts.some((entry) => entry.user.email === email)) {
    throw new ApiError('An account with this email already exists.', 409);
  }
  const user: User = { id: newId('usr'), name, email, headline: 'New member', interests: [] };
  accounts = [...accounts, { user, password }];
  return { token: issueToken(user.id), user };
}

/** PATCH /users/me */
export async function updateMe(changes: Pick<User, 'name' | 'headline'>): Promise<User> {
  await delay(READ_LATENCY_MS);
  const updated: User = { ...requireSessionUser(), name: changes.name, headline: changes.headline };
  accounts = accounts.map((entry) => (entry.user.id === updated.id ? { ...entry, user: updated } : entry));
  return updated;
}

/** GET /users/:id */
export async function getUser(userId: string): Promise<PublicUser> {
  await delay(READ_LATENCY_MS);
  requireSessionUser();
  const account = findAccount(userId);
  if (!account) throw new ApiError('User not found.', 404);
  return toPublicUser(account.user);
}

/** GET /events, soonest first. */
export async function listEvents(): Promise<EventItem[]> {
  await delay(LIST_LATENCY_MS);
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** GET /me/rsvps: ids of events the signed-in user is going to. */
export async function listMyRsvpEventIds(): Promise<string[]> {
  await delay(READ_LATENCY_MS);
  const user = requireSessionUser();
  return events.filter((event) => rsvpKeys.has(rsvpKey(user.id, event.id))).map((event) => event.id);
}

/** PUT /events/:id/rsvp. Idempotent; rejects joining a full event. */
export async function setRsvp(eventId: string, isGoing: boolean): Promise<RsvpStatus> {
  await delay(WRITE_LATENCY_MS);
  const user = requireSessionUser();
  const event = requireEvent(eventId);
  const key = rsvpKey(user.id, eventId);
  if (rsvpKeys.has(key) === isGoing) return { eventId, isGoing, attendeeCount: event.attendeeCount };
  if (isGoing && isEventFull(event)) throw new ApiError('This event is full.', 409);

  const updated = adjustAttendeeCount(event, isGoing ? 1 : -1);
  events = events.map((item) => (item.id === eventId ? updated : item));
  rsvpKeys = isGoing ? new Set([...rsvpKeys, key]) : new Set([...rsvpKeys].filter((entry) => entry !== key));
  return { eventId, isGoing, attendeeCount: updated.attendeeCount };
}

/** GET /events/:id/attendees?limit=N */
export async function listAttendees(eventId: string, limit: number): Promise<PublicUser[]> {
  await delay(READ_LATENCY_MS);
  requireSessionUser();
  requireEvent(eventId);
  // Real RSVPs first; commenters and other members stand in for the seeded attendee counts.
  const rsvpUserIds = [...rsvpKeys].filter((key) => key.endsWith(`:${eventId}`)).map((key) => key.split(':')[0]);
  const commenterIds = comments.filter((comment) => comment.eventId === eventId).map((comment) => comment.userId);
  const orderedIds = [...new Set([...rsvpUserIds, ...commenterIds, ...accounts.map((entry) => entry.user.id)])];
  return orderedIds
    .slice(0, limit)
    .map((id) => findAccount(id)?.user)
    .filter((user): user is User => user !== undefined)
    .map(toPublicUser);
}

/** GET /events/:id/comments, newest first. */
export async function listComments(eventId: string): Promise<CommentWithAuthor[]> {
  await delay(READ_LATENCY_MS);
  requireSessionUser();
  return comments
    .filter((comment) => comment.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(withAuthor);
}

/** POST /events/:id/comments. The author comes from the session, never from the request body. */
export async function createComment(eventId: string, rawBody: string): Promise<CommentWithAuthor> {
  await delay(WRITE_LATENCY_MS);
  const user = requireSessionUser();
  requireEvent(eventId);
  // Re-sanitized here because a server must never trust the client's cleanup.
  const body = sanitizeComment(rawBody);
  if (!body) throw new ApiError("Comment can't be empty.", 422);
  const comment: EventComment = { id: newId('cmt'), eventId, userId: user.id, body, createdAt: new Date().toISOString() };
  comments = [...comments, comment];
  return withAuthor(comment);
}
