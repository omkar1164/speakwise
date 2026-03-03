'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getSelectedTopic, getUserProfileFromLocal, setSelectedTopic } from '@/lib/storage';
import { pickRandomTopic } from '@/lib/utils';

export default function ChatPage(): JSX.Element {
  const router = useRouter();
  const [topic, setTopic] = useState<string>('');

  useEffect(() => {
    const profile = getUserProfileFromLocal();
    if (!profile) {
      router.replace('/select-level');
      return;
    }

    const existingTopic = getSelectedTopic();
    if (existingTopic) {
      setTopic(existingTopic);
      return;
    }

    const randomTopic = pickRandomTopic(profile.selectedTopics);
    if (!randomTopic) {
      router.replace('/landing');
      return;
    }

    setSelectedTopic(randomTopic);
    setTopic(randomTopic);
  }, [router]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Today&apos;s Topic</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)]">
          {topic || 'Preparing topic...'}
        </h1>
        <p className="mt-6 text-base text-[var(--color-muted)]">AI will greet you here...</p>
      </section>
    </main>
  );
}
