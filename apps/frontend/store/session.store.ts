'use client';

import { create } from 'zustand';
import type { ChatMessage } from '@/services/api.service';

type SessionState = {
  sessionId: string | null;
  messages: ChatMessage[];
  elapsedSec: number;
  setSessionId: (sessionId: string) => void;
  addMessage: (message: ChatMessage) => void;
  replaceOptimisticMessage: (optimisticId: string, actualMessage: ChatMessage) => void;
  tick: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  messages: [],
  elapsedSec: 0,
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  replaceOptimisticMessage: (optimisticId, actualMessage) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === optimisticId ? actualMessage : message,
      ),
    })),
  tick: () => set((state) => ({ elapsedSec: state.elapsedSec + 1 })),
  reset: () => set({ sessionId: null, messages: [], elapsedSec: 0 }),
}));
