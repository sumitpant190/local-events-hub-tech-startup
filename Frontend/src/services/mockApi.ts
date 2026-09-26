import { mockComments } from './mockData/comments';
import { mockEvents } from './mockData/events';
import { mockUsers } from './mockData/users';
import type { EventComment, EventItem, User } from './types';

// Stand-in for the real API; swap these bodies for Axios calls once the backend exists.
const MOCK_LATENCY_MS = 600;

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
