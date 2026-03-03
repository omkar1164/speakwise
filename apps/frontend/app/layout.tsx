import type { Metadata } from 'next';
import '../styles/globals.scss';

export const metadata: Metadata = {
  title: 'SpeakWise',
  description: 'Real-time communication builder',
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" data-theme="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}
