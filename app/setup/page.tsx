/**
 * Setup Page
 * First-time GitHub App installation configuration
 * Installation ID only; backend validates everything
 */

import { Suspense } from 'react';
import SetupClient from './SetupClient';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function SetupPage() {
  // Intentional 2 second delay for testing
  await delay(5000);

  return (
    <Suspense fallback={null}>
      <SetupClient />
    </Suspense>
  );
}
