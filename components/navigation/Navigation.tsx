/**
 * Navigation Component
 * Calm, minimal navigation with conditional maintainer link
 */

'use client';

import Link from 'next/link';
import { useAuthStore, selectIsAuthenticated } from '@/store/auth.store';
import { useMaintainerStore } from '@/store/maintainer.store';
import { redirectToGitHubLogin, logout } from '@/lib/auth/github';

export function Navigation() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const repos = useMaintainerStore((state) => state.repos);

  const isMaintainer = isAuthenticated && repos.length > 0;

  const handleLogin = () => {
    redirectToGitHubLogin();
  };

  const handleLogout = async () => {
    await logout();
    clearAuth();
  };

  return (
    <nav className="border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold text-neutral-100 hover:text-white transition-colors"
          >
            Reposignal
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/discovery"
              className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Discovery
            </Link>

            {isMaintainer && (
              <Link
                href="/maintainer"
                className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                Maintainer
              </Link>
            )}

            <Link
              href="/about"
              className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              About
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
                >
                  {user?.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
