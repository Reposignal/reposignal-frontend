/**
 * Auth Bootstrap
 * Fetches current user on app load via /auth/me
 * This is the ONLY source of truth for authentication state
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getCurrentUser } from '@/lib/api/user';

export function AuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function bootstrap() {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to bootstrap auth:', error);
        setUser(null);
      }
    }

    bootstrap();
  }, [setUser]);

  return null;
}
