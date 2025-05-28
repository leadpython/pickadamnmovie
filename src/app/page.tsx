'use client';

import { useState } from 'react';
import MovieNightGroupForm from '@/components/MovieNightGroupForm';
import MovieNightGroupDashboard from '@/components/MovieNightGroupDashboard';
import { createMovieNightGroup } from '@/services/';
import { useStore } from '@/store/store';
import { MovieNightGroup } from '@/types';

export default function Home() {
  const [error, setError] = useState<string | undefined>();
  const { movieNightGroup, setMovieNightGroup } = useStore();

  const handleGroupSubmit = async (groupData: { name: string; description: string; password: string; handle: string; betakey: string }) => {
    try {
      setError(undefined);
      const newGroup = await createMovieNightGroup(groupData);
      setMovieNightGroup(newGroup);
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error instanceof Error ? error.message : 'Failed to create group');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {movieNightGroup ? (
        <MovieNightGroupDashboard group={movieNightGroup as MovieNightGroup} />
      ) : (
        <MovieNightGroupForm onSubmit={handleGroupSubmit} />
      )}
      {error && (
        <div className="mt-4 text-red-600 text-center">
          {error}
        </div>
      )}
    </main>
  );
}
