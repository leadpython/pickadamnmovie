'use client';

import { useState, useEffect } from 'react';
import PlanMovieNightModal from './PlanMovieNightModal';
import MovieNightDetailsModal from './MovieNightDetailsModal';
import { createMovieNight, fetchUpcomingMovieNights, deleteMovieNight } from '@/services';
import { useStore } from '@/store/store';
import { Movie, MovieNight, MovieNightGroup } from '@/types';

interface MovieNightGroupDashboardProps {
  group: MovieNightGroup;
}

export default function MovieNightGroupDashboard({ group }: MovieNightGroupDashboardProps) {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMovieNight, setSelectedMovieNight] = useState<MovieNight | null>(null);
  const { setMovieNightGroup } = useStore();

  useEffect(() => {
    const loadUpcomingMovieNights = async () => {
      try {
        const upcomingMovieNights = await fetchUpcomingMovieNights(group.id);
        setMovieNightGroup({
          ...group,
          upcomingMovieNights
        });
      } catch (error) {
        console.error('Error fetching upcoming movie nights:', error);
      }
    };

    loadUpcomingMovieNights();
  }, [group.id]);

  const handlePlanMovieNight = async (data: { date: string; description: string }) => {
    try {
      await createMovieNight({
        ...data,
        movieNightGroupId: group.id
      });

      // Fetch updated upcoming movie nights
      const upcomingMovieNights = await fetchUpcomingMovieNights(group.id);
      
      // Update the group in the store with the new movie nights
      setMovieNightGroup({
        ...group,
        upcomingMovieNights
      });
    } catch (error) {
      console.error('Error creating movie night:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleMovieNightDeleted = async () => {
    // Fetch updated upcoming movie nights
    const upcomingMovieNights = await fetchUpcomingMovieNights(group.id);
    // Update the group in the store with the new movie nights
    setMovieNightGroup({
      ...group,
      upcomingMovieNights
    });
  };

  const handleMovieNightClick = (movieNight: MovieNight) => {
    setSelectedMovieNight(movieNight);
    setIsDetailsModalOpen(true);
  };

  const handleSelectMovie = (movieId: string) => {
    console.log('Selected movie:', movieId);
    // Here you would typically make an API call to update the movie night
  };

  const handleRandomSelect = () => {
    console.log('Random movie selection requested');
    // Here you would typically make an API call to randomly select a movie
  };

  return (
    <div className="w-full max-w-4xl space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
          <p className="text-gray-600">{group.description}</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Movie Nights</h2>
            <button 
              onClick={() => setIsPlanModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Plan New Movie Night
            </button>
          </div>

          {group.upcomingMovieNights.length > 0 ? (
            <div className="grid gap-4">
              {group.upcomingMovieNights.map((movieNight) => (
                <div
                  key={movieNight.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div 
                      onClick={() => handleMovieNightClick(movieNight)}
                      className="cursor-pointer flex-grow"
                    >
                      <h3 className="font-medium text-gray-900">
                        {new Date(movieNight.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      {movieNight.description && (
                        <p className="text-gray-600 mt-1">{movieNight.description}</p>
                      )}
                      {movieNight.movie && (
                        <p className="text-gray-600 mt-1">Movie: {movieNight.movie}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      {movieNight.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No upcoming movie nights planned yet.</p>
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Plan your first movie night →
              </button>
            </div>
          )}
        </div>
      </div>

      <PlanMovieNightModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSubmit={handlePlanMovieNight}
        movieNightGroupId={group.id}
      />

      {selectedMovieNight && (
        <MovieNightDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedMovieNight(null);
          }}
          movieNight={selectedMovieNight}
          onSelectMovie={handleSelectMovie}
          onRandomSelect={handleRandomSelect}
          onDelete={handleMovieNightDeleted}
        />
      )}
    </div>
  );
} 