/**
 * requireAuth Guard
 * Redirects to home if user is not authenticated
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated } from '@/store/auth.store';

export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return isAuthenticated;
}
