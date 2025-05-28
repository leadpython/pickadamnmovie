import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  clearStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      clearStore: () => set({}),
    }),
    {
      name: 'movie-night-storage', // unique name for localStorage key
    }
  )
); 