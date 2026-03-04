'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';
import TopicCard from '@/components/TopicCard';
import {
  ensureUserId,
  getOnboardingStep,
  getOnboardingLevel,
  saveUserProfile,
} from '@/lib/storage';

const TOPICS = [
  'Travel',
  'Food',
  'Work',
  'Technology',
  'Movies',
  'Fitness',
  'Education',
  'Daily Life',
] as const;

export default function SelectTopicsPage(): JSX.Element {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    const step = getOnboardingStep();
    if (step === 'landing') {
      router.replace('/landing');
      return;
    }
    if (step === 'select-level') {
      router.replace('/select-level');
      return;
    }
  }, [router]);

  const isValid = useMemo(() => selectedTopics.length >= 3, [selectedTopics]);
  const shouldShowMinTopicsError = selectedTopics.length > 0 && !isValid;

  const toggleTopic = (topic: string): void => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((item) => item !== topic);
      }
      return [...prev, topic];
    });
  };

  const handleContinue = (): void => {
    if (!isValid) {
      return;
    }

    const proficiencyLevel = getOnboardingLevel();
    if (!proficiencyLevel) {
      router.replace('/select-level');
      return;
    }

    const userId = ensureUserId();
    saveUserProfile({
      userId,
      proficiencyLevel,
      selectedTopics,
    });

    router.push('/landing');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <section className="w-full max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-all duration-300 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Choose your interests</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Select at least 3 topics. These will be used for your session prompts.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((topic) => (
            <TopicCard
              key={topic}
              topic={topic}
              selected={selectedTopics.includes(topic)}
              onClick={() => toggleTopic(topic)}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-muted)]">{selectedTopics.length} selected</p>
          <PrimaryButton onClick={handleContinue} disabled={!isValid}>
            Continue
          </PrimaryButton>
        </div>

        {shouldShowMinTopicsError && (
          <p className="mt-3 text-sm font-medium text-red-500">Select at least 3 topics to continue.</p>
        )}
      </section>
    </main>
  );
}
