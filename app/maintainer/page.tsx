/**
 * Maintainer Panel
 * Lightweight control surface for repository settings
 * Not a dashboard — no analytics or metrics
 */

'use client';

import { useState } from 'react';
import { useMaintainerStore } from '@/store/maintainer.store';
import { useRequireMaintainer } from '@/lib/guards/requireMaintainer';
import { updateRepositorySettings } from '@/lib/api/user';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';

export default function MaintainerPage() {
  useRequireMaintainer();
  const repos = useMaintainerStore((state) => state.repos);
  const updateRepoState = useMaintainerStore((state) => state.updateRepoState);
  const [updating, setUpdating] = useState<number | null>(null);

  const handleStateChange = async (
    repoId: number,
    newState: 'off' | 'public' | 'paused'
  ) => {
    try {
      setUpdating(repoId);
      await updateRepositorySettings(repoId, { state: newState });
      updateRepoState(repoId, newState);
    } catch (err) {
      console.error('Failed to update repository state:', err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-100 mb-4">
          Maintainer Panel
        </h1>
        <p className="text-neutral-400">
          Manage discovery settings for repositories you maintain.
        </p>
      </div>

      {/* Repositories */}
      {repos.length > 0 ? (
        <div className="space-y-6">
          {repos.map((repo) => (
            <div
              key={repo.githubRepoId}
              className="border border-neutral-800 rounded-lg p-6"
            >
              {/* Repository Name */}
              <h3 className="text-lg font-medium text-neutral-100 mb-4">
                {repo.owner}/{repo.name}
              </h3>

              {/* Current State */}
              <div className="mb-4">
                <span className="text-sm text-neutral-500">Current state:</span>{' '}
                <span className="text-sm font-medium text-neutral-300">
                  {repo.state.charAt(0).toUpperCase() + repo.state.slice(1)}
                </span>
              </div>

              {/* State Controls */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={repo.state === 'public' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleStateChange(repo.githubRepoId, 'public')}
                  disabled={updating === repo.githubRepoId || repo.state === 'public'}
                >
                  Public
                </Button>
                <Button
                  variant={repo.state === 'paused' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleStateChange(repo.githubRepoId, 'paused')}
                  disabled={updating === repo.githubRepoId || repo.state === 'paused'}
                >
                  Paused
                </Button>
                <Button
                  variant={repo.state === 'off' ? 'destructive' : 'ghost'}
                  size="sm"
                  onClick={() => handleStateChange(repo.githubRepoId, 'off')}
                  disabled={updating === repo.githubRepoId || repo.state === 'off'}
                >
                  Off
                </Button>
              </div>

              {/* State Explanations */}
              <div className="mt-4 p-3 bg-neutral-900 rounded text-xs text-neutral-500">
                {repo.state === 'public' && 'Issues are visible in discovery.'}
                {repo.state === 'paused' && 'Discovery temporarily paused.'}
                {repo.state === 'off' && 'Repository excluded from discovery.'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No maintained repositories"
          description="You don't currently maintain any repositories on Reposignal."
        />
      )}

      {/* Philosophy Note */}
      <div className="border-t border-neutral-900 pt-8 mt-8">
        <h2 className="text-lg font-medium text-neutral-200 mb-4">
          About the Maintainer Panel
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          This panel provides simple controls for repository visibility. It does not track
          analytics, contributor performance, or issue metrics. Reposignal is a discovery
          surface, not a project management tool.
        </p>
      </div>
    </div>
  );
}
