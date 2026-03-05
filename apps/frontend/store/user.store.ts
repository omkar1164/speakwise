'use client';

import { create } from 'zustand';

type UserState = {
  userId: string | null;
  xp: number;
  streak: number;
  authToken: string | null;
  setUser: (payload: { userId: string; xp: number; streak: number }) => void;
  setAuthToken: (token: string) => void;
  updateProgress: (payload: { xp: number; streak: number }) => void;
};

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  xp: 0,
  streak: 0,
  authToken: null,
  setUser: ({ userId, xp, streak }) => set({ userId, xp, streak }),
  setAuthToken: (token) => {
    sessionStorage.setItem('commbuilder_auth_token', token);
    set({ authToken: token });
  },
  updateProgress: ({ xp, streak }) => set({ xp, streak }),
}));
