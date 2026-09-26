// Runtime API configuration. EXPO_PUBLIC_* values are inlined into the JS bundle at build time,
// so they must never hold secrets. See Frontend/.env.example.

/** Mock data is the default; set EXPO_PUBLIC_USE_MOCK_DATA=false to talk to the real backend. */
export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

/** Base URL without a trailing slash, e.g. https://api.example.com/v1 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 10_000;

// Fail fast with a clear message instead of sending requests to "undefined/...".
if (!USE_MOCK_DATA && !API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL must be set when EXPO_PUBLIC_USE_MOCK_DATA is "false".');
}
