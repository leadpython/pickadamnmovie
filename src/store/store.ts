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
  isHydrated: boolean;
  setSession: (sessionId: string, group: Group) => void;
  clearSession: () => void;
  clearStore: () => void;
  setHydrated: (state: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      sessionId: null,
      group: null,
      isHydrated: false,
      setSession: (sessionId: string, group: Group) => set({ sessionId, group }),
      clearSession: () => set({ sessionId: null, group: null }),
      clearStore: () => set({ sessionId: null, group: null }),
      setHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: 'movie-night-storage', // unique name for localStorage key
      onRehydrateStorage: () => (state) => {
        // Called after hydration is finished
        state?.setHydrated(true);
      },
    }
  )
); 