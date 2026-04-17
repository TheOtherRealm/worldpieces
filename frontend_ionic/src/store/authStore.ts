/**
 * World Pieces — Authentication state (Zustand store).
 */
import { create } from 'zustand';
import { authApi, saveToken, getToken, clearToken } from '../services/api';

export interface WPUser {
  id: string;
  name: string;
  email: string;
  github_login?: string;
  avatar_url?: string;
  provider: string;
  is_admin: boolean;
  created_at: string;
}

interface AuthState {
  user: WPUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (token: string, user: WPUser) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (token, user) => {
    saveToken(token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearToken();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    try {
      const res = await authApi.getMe();
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      get().logout();
    }
  },

  restoreSession: async () => {
    const token = getToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    set({ token, isLoading: true });
    await get().fetchMe();
  },
}));
