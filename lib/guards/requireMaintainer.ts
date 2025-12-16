/**
 * requireMaintainer Guard
 * Checks if user maintains any repositories
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated } from '@/store/auth.store';
import { useMaintainerStore } from '@/store/maintainer.store';

export function useRequireMaintainer() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const repos = useMaintainerStore((state) => state.repos);

  const isMaintainer = isAuthenticated && repos.length > 0;

  useEffect(() => {
    if (!isAuthenticated || repos.length === 0) {
      router.push('/');
    }
  }, [isAuthenticated, repos.length, router]);

  return isMaintainer;
}
