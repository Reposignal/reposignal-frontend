/**
 * Setup Store
 * Manages first-time GitHub App installation setup state
 * No persistence — state lives only during setup flow
 */

import { create } from 'zustand';

export interface Repository {
  id: number;
  owner: string;
  name: string;
  state: 'off' | 'public' | 'paused';
}

export interface SetupSettings {
  allowUnclassified: boolean;
  allowClassification: boolean;
  allowInference: boolean;
  feedbackEnabled: boolean;
}

export interface SetupContext {
  accountLogin: string;
  repositories: Repository[];
  setupExpiresAt: string;
}

export type SetupStatus = 'idle' | 'loading' | 'fetching-context' | 'error' | 'success';

interface SetupState {
  // Input
  installationId: number | null;

  // Context from backend
  context: SetupContext | null;

  // User selections
  repositories: Repository[];
  settings: SetupSettings;

  // Status
  status: SetupStatus;
  errorMessage: string | null;

  // Actions
  setInstallationId: (id: number) => void;
  setContext: (context: SetupContext) => void;
  updateRepositoryState: (repoId: number, state: 'off' | 'public' | 'paused') => void;
  updateSettings: (key: keyof SetupSettings, value: boolean) => void;
  setStatus: (status: SetupStatus) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useSetupStore = create<SetupState>()((set) => ({
  installationId: null,
  context: null,
  repositories: [],
  settings: {
    allowUnclassified: true,
    allowClassification: true,
    allowInference: true,
    feedbackEnabled: true,
  },
  status: 'idle',
  errorMessage: null,

  setInstallationId: (id) => set({ installationId: id, status: 'idle', errorMessage: null }),

  setContext: (context) =>
    set({
      context,
      repositories: context.repositories,
      status: 'idle',
    }),

  updateRepositoryState: (repoId, state) =>
    set((s) => ({
      repositories: s.repositories.map((r) =>
        r.id === repoId ? { ...r, state } : r
      ),
    })),

  updateSettings: (key, value) =>
    set((s) => ({
      settings: { ...s.settings, [key]: value },
    })),

  setStatus: (status) => set({ status }),

  setError: (message) => set({ errorMessage: message, status: 'error' }),

  reset: () =>
    set({
      installationId: null,
      context: null,
      repositories: [],
      settings: {
        allowUnclassified: true,
        allowClassification: true,
        allowInference: true,
        feedbackEnabled: true,
      },
      status: 'idle',
      errorMessage: null,
    }),
}));
