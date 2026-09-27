import type { User as FirebaseUser } from 'firebase/auth';
import { create } from 'zustand';
import * as authService from '../services/authService';
import { getErrorMessage } from '../services/errors';
import type { User } from '../services/types';
import * as usersService from '../services/usersService';
import {
  hasErrors,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateProfile,
  type ProfileValues,
} from '../utils/validation';
import { useEventsStore } from './eventsStore';

export type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthState {
  /** False until Firebase Auth reports the restored session (or none) on app start. */
  isAuthReady: boolean;
  isLoggedIn: boolean;
  /** Profile from users/{uid}, including `role` for organizer-only UI. */
  currentUser: User | null;
  /** Subscribes to Firebase Auth; call once at app start. Returns the unsubscribe. */
  startAuthListener: () => () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  updateProfile: (values: ProfileValues) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // The uid whose session is loaded, so the listener and login/signup don't start it twice.
  let sessionUid: string | null = null;
  // login/signup load the profile themselves; the listener must not race them (during signup the
  // profile doc doesn't exist yet when Auth reports the new user).
  let isAuthActionInFlight = false;

  const startSession = (user: User) => {
    if (sessionUid !== user.id) {
      sessionUid = user.id;
      // Clear any previous account's RSVP state before loading this account's.
      useEventsStore.getState().resetUserState();
      void useEventsStore.getState().loadMyRsvps();
    }
    set({ isAuthReady: true, isLoggedIn: true, currentUser: user });
  };

  const endSession = () => {
    sessionUid = null;
    useEventsStore.getState().resetUserState();
    usersService.clearUserCache();
    set({ isAuthReady: true, isLoggedIn: false, currentUser: null });
  };

  const handleAuthChange = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      endSession();
      return;
    }
    if (isAuthActionInFlight || sessionUid === firebaseUser.uid) return;
    try {
      const profile = await usersService.getProfile(firebaseUser.uid);
      if (authService.currentUid() !== firebaseUser.uid) return; // Signed out while loading.
      if (profile) {
        startSession(profile);
      } else {
        await authService.logout(); // An account without a profile can't use the app; the listener ends it.
      }
    } catch {
      // Restored session but the profile can't be read (e.g. offline at launch): stay signed in with what
      // Auth knows, so the cached events still show. Role defaults to the least-privileged value.
      startSession({
        id: firebaseUser.uid,
        name: firebaseUser.email?.split('@')[0] ?? 'You',
        email: firebaseUser.email ?? '',
        role: 'attendee',
        avatarUrl: '',
      });
    }
  };

  const runAuthAction = async (action: () => Promise<User>, fallback: string): Promise<AuthResult> => {
    isAuthActionInFlight = true;
    try {
      startSession(await action());
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, fallback) };
    } finally {
      isAuthActionInFlight = false;
    }
  };

  return {
    isAuthReady: false,
    isLoggedIn: false,
    currentUser: null,

    startAuthListener: () => authService.subscribeToAuth((user) => void handleAuthChange(user)),

    login: (email, password) =>
      runAuthAction(() => authService.login(normalizeEmail(email), password), "Couldn't log you in. Please try again."),

    signup: async (name, email, password) => {
      const trimmedName = name.trim();
      // Re-checked here so the store never forwards bad data, whatever the caller validated.
      if (!trimmedName || !isValidEmail(email) || password.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, error: 'Please check your details and try again.' };
      }
      return runAuthAction(
        () => authService.signup(trimmedName, normalizeEmail(email), password),
        "Couldn't create your account. Please try again.",
      );
    },

    updateProfile: async (values) => {
      const currentUser = get().currentUser;
      if (!currentUser) return { ok: false, error: 'You need to be logged in.' };
      if (hasErrors(validateProfile(values))) return { ok: false, error: 'Please fix the highlighted fields.' };
      const name = values.name.trim();
      try {
        await usersService.updateMyName(currentUser.id, name);
        set({ currentUser: { ...currentUser, name } });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, "Couldn't save your profile. Please try again.") };
      }
    },

    // Signing out fires the auth listener, which clears the session.
    logout: () => authService.logout(),
  };
});
