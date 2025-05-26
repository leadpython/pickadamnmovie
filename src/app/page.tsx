'use client';

import { useState, useEffect } from 'react';
import KeyValidationForm from '@/components/KeyValidationForm';
import MovieNightGroupForm from '@/components/MovieNightGroupForm';
import MovieNightGroupDashboard from '@/components/MovieNightGroupDashboard';
import { validateBetaKey } from '@/services/';
import { useStore } from '@/store/store';

// Mock data for demonstration
const mockGroup = {
  id: '1',
  name: 'Friday Night Movie Club',
  description: 'A group of friends who meet every Friday to watch movies together.',
  upcomingMovieNights: [
    {
      id: '1',
      date: '2024-03-22',
      status: 'upcoming' as const,
    },
    {
      id: '2',
      date: '2024-03-29',
      status: 'upcoming' as const,
      movie: 'The Matrix',
    },
  ],
};

export default function Home() {
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [keyError, setKeyError] = useState<string | undefined>();
  const { movieNightGroup, betaKey, setBetaKey, clearStore } = useStore();

  useEffect(() => {
    const checkBetaKeyAndGroup = async () => {
      if (!betaKey) {
        clearStore();
        setIsKeyValidated(false);
        return;
      }

      try {
        const validationResult = await validateBetaKey(betaKey);
        if (validationResult.isValid) {
          setIsKeyValidated(true);
          if (!validationResult.inUse) {
            setKeyError('This beta key is not associated with any movie night group.');
          }
        } else {
          clearStore();
          setIsKeyValidated(false);
          setKeyError('This beta key is not valid. Please try again.');
        }
      } catch (error) {
        console.error('Error validating beta key:', error);
        clearStore();
        setIsKeyValidated(false);
        setKeyError('An error occurred while validating your key. Please try again.');
      }
    };

    checkBetaKeyAndGroup();
  }, [betaKey, clearStore]);

  const handleKeySubmit = async (key: string) => {
    try {
      setKeyError(undefined);
      const validationResult = await validateBetaKey(key);
      if (validationResult.isValid) {
        setBetaKey(key);
        setIsKeyValidated(true);
        if (!validationResult.inUse) {
          setKeyError('This beta key is not associated with any movie night group.');
        }
      } else {
        setKeyError('This beta key is not valid. Please try again.');
        clearStore();
      }
    } catch (error) {
      console.error('Error validating beta key:', error);
      setKeyError('An error occurred while validating your key. Please try again.');
      clearStore();
    }
  };

  const handleGroupSubmit = (groupData: { name: string; description: string }) => {
    // Handle group creation
    console.log('Group created:', groupData);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {!isKeyValidated ? (
        <KeyValidationForm onSubmit={handleKeySubmit} error={keyError} />
      ) : movieNightGroup ? (
        <MovieNightGroupDashboard group={movieNightGroup} />
      ) : (
        <MovieNightGroupForm onSubmit={handleGroupSubmit} />
      )}
    </main>
  );
}
