import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Group {
  id: string;
  handle: string;
  name: string;
}

interface AppState {
  sessionId: string | null;
  group: Group | null;
  setSession: (sessionId: string, group: Group) => void;
  clearSession: () => void;
  clearStore: () => void;
}

export const useStore = create<AppState>((set) => ({
  sessionId: null,
  group: null,
  setSession: (sessionId: string, group: Group) => set({ sessionId, group }),
  clearSession: () => set({ sessionId: null, group: null }),
  clearStore: () => set({ sessionId: null, group: null }),
})); 