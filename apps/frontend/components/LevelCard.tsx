type LevelCardProps = {
  level: string;
  selected: boolean;
  onClick: () => void;
};

export default function LevelCard({ level, selected, onClick }: LevelCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-56 ${
        selected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
      }`}
    >
      <p className="text-base font-semibold">{level}</p>
    </button>
  );
}
