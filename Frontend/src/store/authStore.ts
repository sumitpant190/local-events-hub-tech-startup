import { create } from 'zustand';
import { findUserByEmail } from '../services/mockApi';
import type { User } from '../services/types';
import { isValidEmail, normalizeEmail } from '../utils/validation';

interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
  /** Returns false when no mock user matches the email. */
  login: (email: string) => boolean;
  /** Returns false when the name is blank or the email is invalid. */
  signup: (name: string, email: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isLoggedIn: false,
  currentUser: null,

  login: (email) => {
    const user = findUserByEmail(normalizeEmail(email));
    if (!user) return false;
    set({ isLoggedIn: true, currentUser: user });
    return true;
  },

  signup: (name, email) => {
    const trimmedName = name.trim();
    if (!trimmedName || !isValidEmail(email)) return false;
    // New users live in memory only until the backend exists.
    const user: User = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: normalizeEmail(email),
      headline: 'New member',
      interests: [],
    };
    set({ isLoggedIn: true, currentUser: user });
    return true;
  },

  logout: () => set({ isLoggedIn: false, currentUser: null }),
}));
