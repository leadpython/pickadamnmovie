import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MovieNight {
  id: string;
  date: string;
  description?: string;
}

interface MovieNightGroup {
  id: string;
  handle: string;
  name: string;
  description: string;
  upcomingMovieNights: MovieNight[];
}

interface AppState {
  movieNightGroup: MovieNightGroup | null;
  setMovieNightGroup: (group: MovieNightGroup | null) => void;
  clearStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      movieNightGroup: null,
      setMovieNightGroup: (group) => set({ movieNightGroup: group }),
      clearStore: () => set({ movieNightGroup: null }),
    }),
    {
      name: 'movie-night-storage', // unique name for localStorage key
    }
  )
); 