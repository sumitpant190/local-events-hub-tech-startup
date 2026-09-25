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

export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email);
}

export function findUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

// Account used by the placeholder "Log in" button until the real form lands.
export const DEMO_USER_EMAIL = mockUsers[0].email;
