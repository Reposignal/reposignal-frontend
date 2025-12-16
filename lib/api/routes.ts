/**
 * API Routes
 * 
 * Parsed from context/api-routes.ts OpenAPI spec
 * NEVER call bot endpoints from frontend
 */

import { openAPISpec } from '@/context/api-routes';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Public routes (no auth required)
export const publicRoutes = {
  health: `${API_BASE}/health`,
  discovery: `${API_BASE}/public/discovery`,
  repository: (id: number) => `${API_BASE}/public/repositories/${id}`,
  repositoryIssues: (id: number) => `${API_BASE}/public/repositories/${id}/issues`,
  repositoryStats: (id: number) => `${API_BASE}/public/repositories/${id}/stats`,
  setupContext: `${API_BASE}/setup/context`,
  setupComplete: `${API_BASE}/setup/complete`,
} as const;

// Auth routes
export const authRoutes = {
  me: `${API_BASE}/auth/me`,
  githubLogin: `${API_BASE}/auth/github/login`,
  githubCallback: `${API_BASE}/auth/github/callback`,
  logout: `${API_BASE}/auth/logout`,
} as const;

// User routes (require authentication)
export const userRoutes = {
  updateProfile: `${API_BASE}/user/profile`,
  updateRepositorySettings: (id: number) => `${API_BASE}/user/repositories/${id}/settings`,
  getRepositoryLogs: (id: number) => `${API_BASE}/user/repositories/${id}/logs`,
} as const;

// Helper to check if API is available
export function checkApiAvailability() {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_BASE_URL is not set');
  }
}
