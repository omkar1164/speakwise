type TopicCardProps = {
  topic: string;
  selected: boolean;
  onClick: () => void;
};

export default function TopicCard({ topic, selected, onClick }: TopicCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        selected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
      }`}
    >
      {topic}
    </button>
  );
}
