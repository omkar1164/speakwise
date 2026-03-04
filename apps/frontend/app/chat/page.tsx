'use client';

import Navbar from '@/components/Navbar';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <ChatContainer />
    </main>
  );
}
