'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LevelCard from '@/components/LevelCard';
import PrimaryButton from '@/components/PrimaryButton';
import {
  type ProficiencyLevel,
  getOnboardingStep,
  getOnboardingLevel,
  setOnboardingLevel,
} from '@/lib/storage';

const LEVELS: ProficiencyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export default function SelectLevelPage(): JSX.Element {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyLevel | null>(null);

  useEffect(() => {
    const step = getOnboardingStep();
    if (step === 'landing') {
      router.replace('/landing');
      return;
    }
    if (step === 'select-topics') {
      router.replace('/select-topics');
      return;
    }

    const level = getOnboardingLevel();
    if (level) {
      setSelectedLevel(level);
    }
  }, [router]);

  const handleContinue = (): void => {
    if (!selectedLevel) {
      return;
    }
    setOnboardingLevel(selectedLevel);
    router.push('/select-topics');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <section className="w-full max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-all duration-300 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Choose your level</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Pick one option to personalize your practice.</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <LevelCard
              key={level}
              level={level}
              selected={selectedLevel === level}
              onClick={() => setSelectedLevel(level)}
            />
          ))}
        </div>

        <PrimaryButton
          onClick={handleContinue}
          disabled={!selectedLevel}
          className="mt-8 w-full sm:w-auto"
        >
          Continue
        </PrimaryButton>
      </section>
    </main>
  );
}
