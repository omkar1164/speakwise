'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PrimaryButton from '@/components/PrimaryButton';
import { getUserProfileFromLocal, saveUserProfile, setSelectedTopic } from '@/lib/storage';
import { pickRandomTopic } from '@/lib/utils';

export default function LandingPage(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    const profile = getUserProfileFromLocal();
    if (!profile) {
      router.replace('/select-level');
      return;
    }

    // Keep session storage in sync so chat guards can read required fields after refresh/revisit.
    saveUserProfile(profile);
    setCanStart(profile.selectedTopics.length > 0);
    setLoading(false);
  }, [router]);

  const handleStart = (): void => {
    const profile = getUserProfileFromLocal();
    if (!profile) {
      router.replace('/select-level');
      return;
    }

    // Rehydrate session values expected by chat page before navigation.
    saveUserProfile(profile);
    const topic = pickRandomTopic(profile.selectedTopics);
    if (!topic) {
      return;
    }

    setSelectedTopic(topic);
    router.push('/chat');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <p className="text-sm text-[var(--color-muted)]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <PrimaryButton onClick={handleStart} disabled={!canStart} className="px-7 py-3 text-base">
          Let&apos;s Go
        </PrimaryButton>
      </section>
    </main>
  );
}
