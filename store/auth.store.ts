/**
 * Auth Store
 * Manages authentication state (identity only, NO tokens)
 * Auth state is derived from backend via cookies
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  githubUserId: number;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface AuthState {
  user: User | null;
  
  // Computed
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      
      get isAuthenticated() {
        return get().user !== null;
      },

      setUser: (user) =>
        set({
          user,
        }),

      clearAuth: () =>
        set({
          user: null,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'reposignal-auth',
    }
  )
);
