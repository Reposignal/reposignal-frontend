/**
 * User API Client
 * Handles all authenticated user API calls
 * Authentication via cookies (credentials: 'include')
 */

import { apiPost, apiGet } from './client';
import { userRoutes, authRoutes } from './routes';

export interface Profile {
  githubUserId: number;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface UpdateProfileData {
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface RepositorySettings {
  state: 'off' | 'public' | 'paused';
  allowUnclassified?: boolean;
}

export interface LogEntry {
  id: number;
  actorType: 'system' | 'user' | 'bot';
  actorGithubId: number | null;
  actorUsername: string | null;
  action: string;
  entityType: string;
  entityId: string;
  context: any;
  createdAt: string;
}

/**
 * Get current authenticated user from backend
 * This is the ONLY source of truth for auth state
 */
export async function getCurrentUser(): Promise<Profile | null> {
  try {
    return await apiGet<Profile>(authRoutes.me);
  } catch (error: any) {
    if (error?.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function updateProfile(
  data: UpdateProfileData
): Promise<Profile> {
  return apiPost<Profile>(userRoutes.updateProfile, data);
}

export async function updateRepositorySettings(
  repoId: number,
  settings: RepositorySettings
): Promise<any> {
  return apiPost<any>(userRoutes.updateRepositorySettings(repoId), settings);
}

export async function getRepositoryLogs(
  repoId: number,
  params: { limit?: number; offset?: number } = {}
): Promise<LogEntry[]> {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${userRoutes.getRepositoryLogs(repoId)}?${queryParams.toString()}`;
  return apiGet<LogEntry[]>(url);
}
