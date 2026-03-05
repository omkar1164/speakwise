'use client';

import Navbar from '@/components/Navbar';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const mockTrend = [
  { day: 'Mon', grammar: 8, diversity: 0.32, wpm: 84 },
  { day: 'Tue', grammar: 6, diversity: 0.37, wpm: 92 },
  { day: 'Wed', grammar: 5, diversity: 0.41, wpm: 98 },
  { day: 'Thu', grammar: 4, diversity: 0.45, wpm: 105 },
  { day: 'Fri', grammar: 3, diversity: 0.51, wpm: 109 },
];

export default function DashboardPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 md:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">Total XP: 120</div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          Current streak: 4
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          Sessions completed: 11
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">Avg WPM: 96</div>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-8 md:grid-cols-2">
        <article className="h-72 rounded-xl border border-[var(--color-border)] bg-white p-4">
          <p className="mb-3 text-sm font-medium">Grammar trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTrend}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="grammar" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>
        <article className="h-72 rounded-xl border border-[var(--color-border)] bg-white p-4">
          <p className="mb-3 text-sm font-medium">Vocabulary diversity trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTrend}>
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="diversity" stroke="#9333ea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}
