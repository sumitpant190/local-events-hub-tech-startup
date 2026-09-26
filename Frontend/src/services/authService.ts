import { request } from './api';
import { USE_MOCK_DATA } from './config';
import * as mock from './mockApi';
import type { AuthSession } from './types';

/** Demo login for the Login screen hint; null against the real backend. */
export const demoCredentials = USE_MOCK_DATA
  ? { email: mock.DEMO_USER_EMAIL, password: mock.DEMO_PASSWORD }
  : null;

/** POST /auth/login → { token, user }. Expects a normalized email. */
export function login(email: string, password: string): Promise<AuthSession> {
  return USE_MOCK_DATA
    ? mock.login(email, password)
    : request<AuthSession>({ method: 'POST', url: '/auth/login', data: { email, password } });
}

/** POST /auth/signup → { token, user }. Expects validated, normalized input. */
export function signup(name: string, email: string, password: string): Promise<AuthSession> {
  return USE_MOCK_DATA
    ? mock.signup(name, email, password)
    : request<AuthSession>({ method: 'POST', url: '/auth/signup', data: { name, email, password } });
}
