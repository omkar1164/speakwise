'use client';

import { useState } from 'react';
import type { CorrectionItem } from '@/services/openai.service';

type CorrectionTooltipProps = {
  correction: CorrectionItem;
};

export default function CorrectionTooltip({ correction }: CorrectionTooltipProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer underline decoration-red-400 decoration-2 underline-offset-2"
      >
        {correction.incorrect}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left text-xs text-[var(--color-text)] shadow-lg">
          <p>
            <span className="font-semibold">Correct:</span> {correction.corrected}
          </p>
          <p className="mt-1 text-[var(--color-muted)]">{correction.explanation}</p>
        </div>
      )}
    </span>
  );
}
