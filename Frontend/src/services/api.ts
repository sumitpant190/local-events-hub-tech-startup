import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { API_URL, REQUEST_TIMEOUT_MS } from './config';
import type { ApiEnvelope } from './types';

/** Normalised error thrown by every service call, real or mock. `message` is safe to show users. */
export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

// The JWT lives in memory only; authStore sets it on login and clears it on logout.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/** Called once when an authenticated request comes back 401 (expired or revoked session). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// A 401 from these means "wrong credentials", not "session expired", so it must not sign anyone out.
const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/signup'];

export const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) config.headers.set('Authorization', `Bearer ${authToken}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(new ApiError('Something went wrong. Please try again.'));
    }
    const isCredentialRequest = CREDENTIAL_ENDPOINTS.some((path) => error.config?.url?.startsWith(path));
    if (error.response?.status === 401 && !isCredentialRequest) {
      authToken = null;
      onUnauthorized?.();
    }
    return Promise.reject(toApiError(error as AxiosError<Partial<ApiEnvelope<unknown>>>));
  },
);

function toApiError(error: AxiosError<Partial<ApiEnvelope<unknown>>>): ApiError {
  const status = error.response?.status ?? null;
  const serverMessage = error.response?.data?.error;
  if (typeof serverMessage === 'string' && serverMessage.length > 0) return new ApiError(serverMessage, status);
  if (!error.response) {
    return new ApiError(
      error.code === 'ECONNABORTED' ? 'The server took too long to respond.' : "Can't reach the server. Check your connection.",
    );
  }
  if (status === 401) return new ApiError('Your session has expired. Please log in again.', status);
  return new ApiError('Something went wrong. Please try again.', status);
}

/** Sends a request and unwraps the backend's `{ success, data, error }` envelope. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<ApiEnvelope<T>>(config);
  const envelope = response.data;
  if (!envelope?.success || envelope.data === null || envelope.data === undefined) {
    throw new ApiError(envelope?.error ?? 'Unexpected response from the server.', response.status);
  }
  return envelope.data;
}
