import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MovieNightGroup {
  id: string;
  name: string;
  description: string;
}

interface AppState {
  betaKey: string | null;
  movieNightGroup: MovieNightGroup | null;
  setBetaKey: (key: string | null) => void;
  setMovieNightGroup: (group: MovieNightGroup | null) => void;
  clearStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      betaKey: null,
      movieNightGroup: null,
      setBetaKey: (key) => set({ betaKey: key }),
      setMovieNightGroup: (group) => set({ movieNightGroup: group }),
      clearStore: () => set({ betaKey: null, movieNightGroup: null }),
    }),
    {
      name: 'movie-night-storage', // unique name for localStorage key
    }
  )
); 