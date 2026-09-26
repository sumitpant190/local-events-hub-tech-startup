import { mockComments } from './mockData/comments';
import { mockEvents } from './mockData/events';
import { mockUsers } from './mockData/users';
import type { EventComment, EventItem, User } from './types';

// Stand-in for the real API; swap these bodies for Axios calls once the backend exists.
// Long enough for the skeleton shimmer to register, short enough not to annoy.
const MOCK_LATENCY_MS = 1000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function fetchEvents(): Promise<EventItem[]> {
  await delay(MOCK_LATENCY_MS);
  return [...mockEvents].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getEventComments(eventId: string): EventComment[] {
  return mockComments
    .filter((comment) => comment.eventId === eventId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function findUserById(id: string): User | undefined {
  return accounts.find((account) => account.user.id === id)?.user;
}

const COMMENT_LATENCY_MS = 350;

/** Mock comment write. Expects an already-sanitized body; a real server re-validates it. */
export async function postComment(eventId: string, userId: string, body: string): Promise<EventComment> {
  await delay(COMMENT_LATENCY_MS);
  return {
    id: `cmt-${Date.now()}`,
    eventId,
    userId,
    body,
    createdAt: new Date().toISOString(),
  };
}

const RSVP_LATENCY_MS = 400;

/** Mock RSVP write. Resolves on success; a real API would reject on failure. */
export async function updateRsvp(_eventId: string, _isGoing: boolean): Promise<void> {
  await delay(RSVP_LATENCY_MS);
}

/**
 * A few users to show as "also going": people who commented on the event first,
 * then other members. Deterministic so avatars don't reshuffle between renders.
 */
export function getAttendeePreview(eventId: string, excludeUserId?: string, limit = 3): User[] {
  const commenterIds = getEventComments(eventId).map((comment) => comment.userId);
  const orderedIds = [...new Set([...commenterIds, ...mockUsers.map((user) => user.id)])];
  return orderedIds
    .filter((id) => id !== excludeUserId)
    .slice(0, limit)
    .map((id) => findUserById(id))
    .filter((user): user is User => user !== undefined);
}

// Mock credentials: plaintext and in memory only. The backend phase replaces this with real, hashed auth.
export const DEMO_PASSWORD = 'startup123';
export const DEMO_USER_EMAIL = mockUsers[0].email;

interface MockAccount {
  user: User;
  password: string;
}

let accounts: MockAccount[] = mockUsers.map((user) => ({ user, password: DEMO_PASSWORD }));

/** Expects a normalized email. Returns the user only when email and password both match. */
export function authenticate(email: string, password: string): User | undefined {
  const account = accounts.find((entry) => entry.user.email === email);
  return account && account.password === password ? account.user : undefined;
}

/** Returns false when the email is already registered. */
export function registerAccount(user: User, password: string): boolean {
  if (accounts.some((entry) => entry.user.email === user.email)) return false;
  accounts = [...accounts, { user, password }];
  return true;
}
