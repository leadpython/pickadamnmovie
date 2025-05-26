'use client';

import { useState, useEffect } from 'react';
import KeyValidationForm from '@/components/KeyValidationForm';
import MovieNightGroupForm from '@/components/MovieNightGroupForm';
import MovieNightGroupDashboard from '@/components/MovieNightGroupDashboard';
import { validateBetaKey, createMovieNightGroup } from '@/services/';
import { useStore } from '@/store/store';

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

  const handleGroupSubmit = async (groupData: { name: string; description: string; password: string; handle: string }) => {
    try {
      if (!betaKey) {
        setKeyError('Beta key is required');
        return;
      }

      const newGroup = await createMovieNightGroup({
        ...groupData,
        betakey: betaKey
      });

      useStore.getState().setMovieNightGroup(newGroup);
    } catch (error) {
      console.error('Error creating group:', error);
      setKeyError(error instanceof Error ? error.message : 'Failed to create group');
    }
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
