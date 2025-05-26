import { Movie, MovieNight, MovieNightGroup } from '@/types';
import { useStore } from '@/store/store';

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

export const createMovieNightGroup = async (groupData: {
  handle: string;
  name: string;
  description: string;
  password: string;
  betakey: string;
}): Promise<MovieNightGroup> => {
  const response = await fetch('/api/create-movie-night-group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create movie night group');
  }

  const result = await response.json();
  return result.group;
};

export const createMovieNight = async (movieNightData: {
  date: string;
  description: string;
  movieNightGroupId: string;
}): Promise<MovieNight> => {
  const response = await fetch('/api/create-movie-night', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(movieNightData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create movie night');
  }

  const result = await response.json();
  return result.movieNight;
};
