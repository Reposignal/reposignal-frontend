/**
 * GitHub OAuth Callback Page
 * Backend handles the OAuth flow and sets cookies
 * Frontend just redirects after callback
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/user';
import { useAuthStore } from '@/store/auth.store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Backend has already handled OAuth and set cookies
        // Just fetch the user to update our local state
        const user = await getCurrentUser();
        
        if (user) {
          setUser(user);
        }
        
        router.push('/');
      } catch (err) {
        console.error('Auth callback error:', err);
        router.push('/');
      }
    }

    handleCallback();
  }, [router, setUser]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="text-neutral-400">Completing authentication...</div>
      </div>
    </div>
  );
}
