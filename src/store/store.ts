import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  betaKey: string | null;
  setBetaKey: (key: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      betaKey: null,
      setBetaKey: (key) => set({ betaKey: key }),
    }),
    {
      name: 'movie-night-storage', // unique name for localStorage key
    }
  )
); 