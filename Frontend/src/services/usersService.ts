import { request } from './api';
import { USE_MOCK_DATA } from './config';
import * as mock from './mockApi';
import type { PublicUser, User } from './types';

/** PATCH /users/me → updated User (the signed-in account only). */
export function updateMe(changes: Pick<User, 'name' | 'headline'>): Promise<User> {
  return USE_MOCK_DATA ? mock.updateMe(changes) : request<User>({ method: 'PATCH', url: '/users/me', data: changes });
}

/** GET /users/:id → public profile (no email). */
export function getUser(userId: string): Promise<PublicUser> {
  return USE_MOCK_DATA
    ? mock.getUser(userId)
    : request<PublicUser>({ method: 'GET', url: `/users/${encodeURIComponent(userId)}` });
}
