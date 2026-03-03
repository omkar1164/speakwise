'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfileFromLocal } from '@/lib/storage';

export default function HomePage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const profile = getUserProfileFromLocal();
    router.replace(profile ? '/landing' : '/select-level');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-6">
      <p className="text-sm text-[var(--color-muted)]">Preparing your space...</p>
    </main>
  );
}
