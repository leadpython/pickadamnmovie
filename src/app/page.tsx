'use client';

import { useState } from 'react';
import KeyValidationForm from '@/components/KeyValidationForm';
import MovieNightGroupForm from '@/components/MovieNightGroupForm';
import MovieNightGroupDashboard from '@/components/MovieNightGroupDashboard';
import { appService } from '@/services/appService';

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
  const [hasExistingGroup, setHasExistingGroup] = useState(false);
  const [keyError, setKeyError] = useState<string | undefined>();

  const handleKeySubmit = async (key: string) => {
    try {
      setKeyError(undefined);
      const validationResult = await appService.validateBetaKey(key);
      if (validationResult) {
        setIsKeyValidated(true);
        // In a real app, this would be an API call to check if key is associated with a group
        const isAssociatedWithGroup = false; // Change this to false to test the group creation form
        setHasExistingGroup(isAssociatedWithGroup);
      } else {
        setKeyError('Invalid beta key. Please try again.');
      }
    } catch (error) {
      console.error('Error validating beta key:', error);
      setKeyError('An error occurred while validating your key. Please try again.');
    }
  };

  const handleGroupSubmit = (groupData: { name: string; description: string }) => {
    // Handle group creation
    console.log('Group created:', groupData);
    setHasExistingGroup(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {!isKeyValidated ? (
        <KeyValidationForm onSubmit={handleKeySubmit} error={keyError} />
      ) : hasExistingGroup ? (
        <MovieNightGroupDashboard group={mockGroup} />
      ) : (
        <MovieNightGroupForm onSubmit={handleGroupSubmit} />
      )}
    </main>
  );
}
