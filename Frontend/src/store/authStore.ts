import { create } from 'zustand';
import { getErrorMessage, setAuthToken, setUnauthorizedHandler } from '../services/api';
import * as authService from '../services/authService';
import type { AuthSession, User } from '../services/types';
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
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  updateProfile: (values: ProfileValues) => Promise<AuthResult>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const startSession = ({ token, user }: AuthSession) => {
    setAuthToken(token);
    // Clear any previous account's RSVP state before loading this account's.
    useEventsStore.getState().resetUserState();
    set({ isLoggedIn: true, currentUser: user });
    void useEventsStore.getState().loadMyRsvps();
  };

  return {
    isLoggedIn: false,
    currentUser: null,

    login: async (email, password) => {
      try {
        startSession(await authService.login(normalizeEmail(email), password));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, "Couldn't log you in. Please try again.") };
      }
    },

    signup: async (name, email, password) => {
      const trimmedName = name.trim();
      // Re-checked here so the store never forwards bad data, whatever the caller validated.
      if (!trimmedName || !isValidEmail(email) || password.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, error: 'Please check your details and try again.' };
      }
      try {
        startSession(await authService.signup(trimmedName, normalizeEmail(email), password));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, "Couldn't create your account. Please try again.") };
      }
    },

    updateProfile: async (values) => {
      if (!get().currentUser) return { ok: false, error: 'You need to be logged in.' };
      if (hasErrors(validateProfile(values))) return { ok: false, error: 'Please fix the highlighted fields.' };
      try {
        const updated = await usersService.updateMe({ name: values.name.trim(), headline: values.headline.trim() });
        set({ currentUser: updated });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, "Couldn't save your profile. Please try again.") };
      }
    },

    logout: () => {
      setAuthToken(null);
      useEventsStore.getState().resetUserState();
      set({ isLoggedIn: false, currentUser: null });
    },
  };
});

// An expired or revoked token (401 from any authenticated call) signs the user out.
setUnauthorizedHandler(() => useAuthStore.getState().logout());
