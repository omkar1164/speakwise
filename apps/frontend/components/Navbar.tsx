export default function Navbar(): JSX.Element {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <p className="text-lg font-bold tracking-tight text-[var(--color-text)]">SpeakWise</p>
        <div className="h-10 w-10 rounded-full border border-[var(--color-border)] bg-gradient-to-br from-blue-200 to-indigo-300" />
      </div>
    </header>
  );
}
