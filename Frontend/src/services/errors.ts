import { FirebaseError } from 'firebase/app';

// Firebase error codes → messages safe to show users. Anything unlisted gets the caller's fallback,
// so raw SDK text (which can include internals) never reaches the UI.
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Choose a stronger password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': "Can't reach the server. Check your connection.",
  'permission-denied': "You don't have permission to do that.",
  unavailable: "Can't reach the server. Check your connection.",
  'deadline-exceeded': 'The server took too long to respond.',
  'not-found': 'That item no longer exists.',
};

/** A failure whose message is already written for users (e.g. "This event was removed"). */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError) return MESSAGES[error.code] ?? fallback;
  if (error instanceof AppError) return error.message;
  return fallback;
}
