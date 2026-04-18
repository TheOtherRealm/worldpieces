/**
 * World Pieces — API client and token management.
 * Connects to the FastAPI backend. Base URL is read from VITE_API_URL env var.
 */
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8765';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'wp_access_token';

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  getMe: () => api.get('/auth/me'),
  githubLoginUrl: () => `${API_BASE}/auth/github/login`,
};

// ── Profiles ──────────────────────────────────────────────────────────────────

export const profilesApi = {
  getMyProfile: () => api.get('/profiles/me'),
  updateMyProfile: (data: Record<string, unknown>) => api.put('/profiles/me', data),
  getProfile: (userId: string) => api.get(`/profiles/${userId}`),
  searchProfiles: (q: string) => api.get('/profiles/search', { params: { q } }),
  deleteMyAccount: () => api.delete('/profiles/me'),
};

// ── Examples ──────────────────────────────────────────────────────────────────

export const examplesApi = {
  list: (params?: Record<string, unknown>) => api.get('/examples/', { params }),
  listByDiscipline: (discipline: string) =>
    api.get(`/examples/discipline/${discipline}`),
  get: (id: string) => api.get(`/examples/${id}`),
  create: (data: Record<string, unknown>) => api.post('/examples/', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/examples/${id}`, data),
  delete: (id: string) => api.delete(`/examples/${id}`),
  markSolved: (id: string) => api.post(`/examples/${id}/solved`),
};

// ── Bounties ──────────────────────────────────────────────────────────────────

export const bountiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/bounties/', { params }),
  get: (id: string) => api.get(`/bounties/${id}`),
  create: (data: Record<string, unknown>) => api.post('/bounties/', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/bounties/${id}`, data),
  delete: (id: string) => api.delete(`/bounties/${id}`),
  checkSponsorable: (login: string) =>
    api.get(`/bounties/sponsors/check/${login}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  getMe: () => api.get('/users/me'),
};

export default api;
