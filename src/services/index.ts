import { useStore } from '@/store/store';

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

interface BetaKeyValidationResponse {
  isValid: boolean;
  inUse: boolean;
  groupData: MovieNightGroup | null;
}

export const validateBetaKey = async (key: string): Promise<BetaKeyValidationResponse> => {
  const response = await fetch('/api/validate-beta-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    throw new Error('Failed to validate beta key');
  }

  const result = await response.json();
  
  // If the key is valid and in use, set the movie night group in the store
  if (result.isValid && result.inUse && result.groupData) {
    // Initialize with empty upcomingMovieNights if not provided
    const groupWithMovieNights = {
      ...result.groupData,
      upcomingMovieNights: result.groupData.upcomingMovieNights || []
    };
    useStore.getState().setMovieNightGroup(groupWithMovieNights);
  }

  return result;
};
