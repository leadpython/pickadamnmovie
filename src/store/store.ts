import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Movie {
  id: string;
  title: string;
  nominatedBy: string;
}

interface MovieNight {
  id: string;
  date: string;
  status: 'upcoming' | 'completed';
  movie?: string;
  description?: string;
  nominatedMovies?: Movie[];
}

interface MovieNightGroup {
  id: string;
  handle: string;
  name: string;
  description: string;
  betakey: string;
  upcomingMovieNights: MovieNight[];
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