/**
 * Setup Client Component
 * All UI and business logic for setup page
 */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSetupStore } from '@/store/setup.store';
import { getSetupContext, completeSetup } from '@/lib/api/setup';
import { Button } from '@/components/common/Button';

export default function SetupClient() {
  const params = useSearchParams();
  const {
    installationId,
    context,
    repositories,
    settings,
    status,
    errorMessage,
    setInstallationId,
    setContext,
    updateRepositoryState,
    updateSettings,
    setStatus,
    setError,
  } = useSetupStore();

  // Parse URL params and fetch setup context
  useEffect(() => {
    // Parse installation_id from URL if not already set
    if (!installationId) {
      const idParam = params?.get('installation_id');

      if (!idParam || !/^\d+$/.test(idParam)) {
        setError('Invalid installation link.');
        return;
      }

      const id = Number(idParam);
      setInstallationId(id);
      return; // Let the next render fetch the context
    }

    // Fetch context if we have installation ID but no context yet
    if (context) {
      return;
    }

    async function fetch() {
      try {
        setStatus('fetching-context');
        const data = await getSetupContext(installationId as number);
        setContext(data);
      } catch (err: any) {
        const message =
          err.statusCode === 404
            ? 'Installation not found.'
            : err.statusCode === 409
              ? 'Setup already completed.'
              : err.statusCode === 410
                ? 'Setup window expired.'
                : err.statusCode === 403
                  ? 'Installation access revoked.'
                  : err.statusCode === 502
                    ? 'GitHub temporarily unavailable.'
                    : err.message || 'Unable to fetch setup context.';

        setError(message);
      }
    }

    fetch();
  }, [params, installationId, context, setInstallationId, setStatus, setContext, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!installationId) return;

    try {
      setStatus('loading');

      await completeSetup({
        installation_id: installationId,
        repositories: repositories.map((r) => ({
          repoId: r.id,
          state: r.state,
        })),
        settings,
      });

      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please try again.');
    }
  };

  // Invalid or missing installation ID
  if (status === 'error' && !context) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8">
            <h1 className="text-2xl font-semibold text-neutral-100 mb-4">Setup error</h1>
            <p className="text-neutral-400 mb-6">{errorMessage}</p>
            <p className="text-sm text-neutral-500">
              Check that you're using the correct setup link from GitHub.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading context
  if (status === 'fetching-context' || !context) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-neutral-400">Loading setup...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8">
            <h1 className="text-2xl font-semibold text-neutral-100 mb-4">Setup complete</h1>
            <p className="text-neutral-400 mb-6">
              You can now manage Reposignal from GitHub. Return to your account to adjust settings at any time.
            </p>
            <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="w-full">
                Go to GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Setup form
  return (
    <>
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-neutral-100 mb-2">Set up Reposignal</h1>
              <p className="text-neutral-400">
                Choose how Reposignal should surface work from your repositories.
                You can change these settings later from GitHub.
              </p>
            </div>

            {/* Setup window notice */}
            {context.setupExpiresAt && (
              <div className="mb-6 p-4 rounded-lg border border-neutral-800 bg-neutral-900/40">
                <p className="text-sm text-neutral-500">
                  This setup link expires in{' '}
                  {Math.ceil(
                    (new Date(context.setupExpiresAt).getTime() - Date.now()) / 60000
                  )}{' '}
                  minutes.
                </p>
              </div>
            )}

            {/* Error message */}
            {status === 'error' && errorMessage && (
              <div className="mb-6 p-4 rounded-lg border border-red-900/50 bg-red-900/10">
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Repository Settings */}
              <div>
                <h2 className="text-lg font-medium text-neutral-200 mb-4">Repositories</h2>
                <div className="space-y-4">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-neutral-100 font-medium">
                          {repo.owner}/{repo.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {(['public', 'paused', 'off'] as const).map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => updateRepositoryState(repo.id, state)}
                            className={`px-3 py-2 text-sm rounded-lg border transition-all capitalize ${
                              repo.state === state
                                ? 'border-neutral-600 bg-neutral-800 text-neutral-100'
                                : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-neutral-500 mt-2">
                        {repo.state === 'public' && 'This repo will appear in discovery.'}
                        {repo.state === 'paused' && 'Issues will not appear in discovery.'}
                        {repo.state === 'off' && 'Reposignal is disabled for this repo.'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Settings */}
              <div>
                <h2 className="text-lg font-medium text-neutral-200 mb-4">Settings</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.allowUnclassified}
                      onChange={(e) =>
                        updateSettings('allowUnclassified', e.target.checked)
                      }
                      className="mt-1 accent-neutral-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        Allow unclassified issues
                      </div>
                      <div className="text-xs text-neutral-500">
                        Show issues without a difficulty level in discovery.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.allowClassification}
                      onChange={(e) =>
                        updateSettings('allowClassification', e.target.checked)
                      }
                      className="mt-1 accent-neutral-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        Allow issue classification
                      </div>
                      <div className="text-xs text-neutral-500">
                        Let Reposignal classify issue difficulty and type.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.allowInference}
                      onChange={(e) =>
                        updateSettings('allowInference', e.target.checked)
                      }
                      className="mt-1 accent-neutral-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        Allow domain & framework inference
                      </div>
                      <div className="text-xs text-neutral-500">
                        Let Reposignal infer domains and frameworks from your code.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.feedbackEnabled}
                      onChange={(e) =>
                        updateSettings('feedbackEnabled', e.target.checked)
                      }
                      className="mt-1 accent-neutral-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        Enable contributor feedback
                      </div>
                      <div className="text-xs text-neutral-500">
                        Collect feedback from contributors about issue difficulty and responsiveness.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={status === 'loading'}
                  className="flex-1"
                >
                  {status === 'loading' ? 'Saving...' : 'Complete setup'}
                </Button>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="ghost" className="w-full">
                    Cancel
                  </Button>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
