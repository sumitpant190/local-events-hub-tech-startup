import { create } from 'zustand';
import { authenticate, registerAccount, updateAccountProfile } from '../services/mockApi';
import type { User } from '../services/types';
import {
  hasErrors,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateProfile,
  type ProfileValues,
} from '../utils/validation';

export type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => AuthResult;
  signup: (name: string, email: string, password: string) => AuthResult;
  updateProfile: (values: ProfileValues) => AuthResult;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isLoggedIn: false,
  currentUser: null,

  login: (email, password) => {
    const user = authenticate(normalizeEmail(email), password);
    if (!user) return { ok: false, error: 'Incorrect email or password.' };
    set({ isLoggedIn: true, currentUser: user });
    return { ok: true };
  },

  signup: (name, email, password) => {
    const trimmedName = name.trim();
    // Re-checked here so the store never accepts bad data, whatever the caller validated.
    if (!trimmedName || !isValidEmail(email) || password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: 'Please check your details and try again.' };
    }
    // New users live in memory only until the backend exists.
    const user: User = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: normalizeEmail(email),
      headline: 'New member',
      interests: [],
    };
    if (!registerAccount(user, password)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    set({ isLoggedIn: true, currentUser: user });
    return { ok: true };
  },

  updateProfile: (values) => {
    const { currentUser } = get();
    if (!currentUser) return { ok: false, error: 'You need to be logged in.' };
    if (hasErrors(validateProfile(values))) return { ok: false, error: 'Please fix the highlighted fields.' };
    const updated: User = { ...currentUser, name: values.name.trim(), headline: values.headline.trim() };
    updateAccountProfile(updated);
    set({ currentUser: updated });
    return { ok: true };
  },

  logout: () => set({ isLoggedIn: false, currentUser: null }),
}));
