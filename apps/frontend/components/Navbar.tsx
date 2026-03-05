'use client';

import { useUserStore } from '@/store/user.store';

export default function Navbar(): JSX.Element {
  const xp = useUserStore((state) => state.xp);
  const streak = useUserStore((state) => state.streak);

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <p className="text-lg font-bold tracking-tight text-[var(--color-text)]">SpeakWise</p>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text)]">
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">XP: {xp}</span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
            Streak: {streak}
          </span>
        </div>
      </div>
    </header>
  );
}
