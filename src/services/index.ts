import { Movie, MovieNight, MovieNightGroup } from '@/types';
import { useStore } from '@/store/store';

interface BetaKeyValidationResponse {
  isValid: boolean;
  inUse: boolean;
  groupData: MovieNightGroup | null;
}

interface HandleValidationResponse {
  isValid: boolean;
  isTaken: boolean;
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

export async function createMovieNightGroup(groupData: {
  handle: string;
  name: string;
  password: string;
  betakey: string;
}) {
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

  const data = await response.json();
  return data.group;
}

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

export const fetchUpcomingMovieNights = async (movieNightGroupId: string): Promise<MovieNight[]> => {
  const response = await fetch(`/api/movie-night-group/${movieNightGroupId}/upcoming-movie-nights`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch upcoming movie nights');
  }

  const result = await response.json();
  return result.movieNights;
};

export const validateHandle = async (handle: string): Promise<HandleValidationResponse> => {
  const response = await fetch('/api/validate-handle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ handle }),
  });

  if (!response.ok) {
    throw new Error('Failed to validate handle');
  }

  return response.json();
};

export const deleteMovieNight = async (movieNightId: string): Promise<void> => {
  const response = await fetch(`/api/movie-night/${movieNightId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete movie night');
  }
};
