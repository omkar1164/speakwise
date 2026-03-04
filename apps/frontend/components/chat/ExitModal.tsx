'use client';

type ExitModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ExitModal({ isOpen, onCancel, onConfirm }: ExitModalProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Exit chat?</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Your current voice conversation will end and session data will be cleared.
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}
