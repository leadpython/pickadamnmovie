'use client';

import { useState, useEffect } from 'react';
import PlanMovieNightModal from './PlanMovieNightModal';
import MovieNightDetailsModal from './MovieNightDetailsModal';
import { createMovieNight, fetchUpcomingMovieNights, deleteMovieNight, selectRandomMovie, getMovieDetails } from '@/services';
import { useStore } from '@/store/store';
import { Movie, MovieNight, MovieNightGroup } from '@/types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  });
};

export default function MovieNightGroupDashboard() {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMovieNight, setSelectedMovieNight] = useState<MovieNight | null>(null);
  const movieNightGroup = useStore((state) => state.movieNightGroup);
  const { setMovieNightGroup } = useStore();

  // Sort and separate movie nights into upcoming and past
  const sortedMovieNights = movieNightGroup?.upcomingMovieNights.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ) || [];

  const now = new Date();
  const upcomingMovieNights = sortedMovieNights.filter(mn => new Date(mn.date) >= now);
  const pastMovieNights = sortedMovieNights
    .filter(mn => new Date(mn.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Reverse chronological order

  useEffect(() => {
    const loadUpcomingMovieNights = async () => {
      if (!movieNightGroup?.id) return;
      try {
        console.log('Fetching upcoming movie nights for group:', movieNightGroup.id);
        const upcomingMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
        console.log('Fetched upcoming movie nights:', upcomingMovieNights);
        
        // Update the group in the store with the fetched movie nights
        setMovieNightGroup({
          ...movieNightGroup,
          upcomingMovieNights
        });
      } catch (error) {
        console.error('Error fetching upcoming movie nights:', error);
      }
    };

    loadUpcomingMovieNights();
  }, [movieNightGroup?.id]); // Only depend on the ID to avoid unnecessary fetches

  const handlePlanMovieNight = async (data: { date: string; description: string }) => {
    if (!movieNightGroup) return;
    try {
      console.log('Creating movie night with data:', data);
      const response = await createMovieNight({
        ...data,
        movieNightGroupId: movieNightGroup.id
      });
      console.log('Movie night created:', response);

      // Fetch updated upcoming movie nights from Supabase
      const upcomingMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
      console.log('Fetched updated movie nights from Supabase:', upcomingMovieNights);
      
      // Update the group in the store with the fresh data from Supabase
      setMovieNightGroup({
        ...movieNightGroup,
        upcomingMovieNights
      });

      // Close the modal
      setIsPlanModalOpen(false);
    } catch (error) {
      console.error('Error creating movie night:', error);
    }
  };

  const handleMovieNightDeleted = async () => {
    if (!movieNightGroup) return;
    try {
      // Fetch updated upcoming movie nights from Supabase
      const upcomingMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
      console.log('Fetched updated movie nights after deletion:', upcomingMovieNights);
      
      // Update the group in the store with the fresh data from Supabase
      setMovieNightGroup({
        ...movieNightGroup,
        upcomingMovieNights
      });
    } catch (error) {
      console.error('Error updating movie nights after deletion:', error);
    }
  };

  const handleMovieNightUpdated = async (updatedMovieNight: MovieNight) => {
    if (!movieNightGroup) return;
    try {
      // Fetch the latest movie night data from Supabase
      const upcomingMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
      console.log('Fetched updated movie nights after update:', upcomingMovieNights);
      
      // Update the group in the store with the fresh data from Supabase
      setMovieNightGroup({
        ...movieNightGroup,
        upcomingMovieNights
      });

      // Update the selected movie night with the latest data
      const updatedSelectedMovieNight = upcomingMovieNights.find(mn => mn.id === updatedMovieNight.id);
      if (updatedSelectedMovieNight) {
        setSelectedMovieNight(updatedSelectedMovieNight);
      }
    } catch (error) {
      console.error('Error updating movie night:', error);
    }
  };

  const handleMovieNightClick = (movieNight: MovieNight) => {
    setSelectedMovieNight(movieNight);
    setIsDetailsModalOpen(true);
  };

  const handleSelectMovie = (movieId: string) => {
    console.log('Selected movie:', movieId);
    // Here you would typically make an API call to update the movie night
  };

  const handleRandomSelect = async () => {
    if (!selectedMovieNight || !movieNightGroup) return;
    try {
      await selectRandomMovie(selectedMovieNight.id);
      
      // Fetch updated upcoming movie nights from Supabase
      const upcomingMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
      console.log('Fetched updated movie nights after random selection:', upcomingMovieNights);
      
      // Update the group in the store with the fresh data from Supabase
      setMovieNightGroup({
        ...movieNightGroup,
        upcomingMovieNights
      });

      // Update the selected movie night with the latest data
      const updatedSelectedMovieNight = upcomingMovieNights.find(mn => mn.id === selectedMovieNight.id);
      if (updatedSelectedMovieNight) {
        setSelectedMovieNight(updatedSelectedMovieNight);
      }
    } catch (error) {
      console.error('Error selecting random movie:', error);
    }
  };

  const handleDeleteMovieNight = async (movieNightId: string) => {
    if (!movieNightGroup) return;
    if (!window.confirm('Are you sure you want to delete this movie night?')) {
      return;
    }

    try {
      await deleteMovieNight(movieNightId);
      
      // Fetch updated upcoming movie nights from Supabase
      const updatedMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
      console.log('Fetched updated movie nights after deletion:', updatedMovieNights);
      
      // Update the group in the store with the fresh data from Supabase
      setMovieNightGroup({
        ...movieNightGroup,
        upcomingMovieNights: updatedMovieNights
      });
    } catch (error) {
      console.error('Error deleting movie night:', error);
    }
  };

  const [movieDetails, setMovieDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!movieNightGroup) return;
    const fetchMovieDetails = async () => {
      const details: Record<string, any> = {};
      for (const movieNight of movieNightGroup.upcomingMovieNights) {
        if (movieNight.imdb_id) {
          try {
            const movieData = await getMovieDetails(movieNight.imdb_id);
            details[movieNight.id] = movieData;
          } catch (error) {
            console.error(`Error fetching details for movie ${movieNight.imdb_id}:`, error);
          }
        }
      }
      setMovieDetails(details);
    };

    fetchMovieDetails();
  }, [movieNightGroup?.upcomingMovieNights]);

  if (!movieNightGroup) {
    return <div className="text-center py-8 bg-gray-50 rounded-lg">No group loaded.</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{movieNightGroup.name}</h1>
          <p className="text-gray-600">{movieNightGroup.description}</p>
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

          {upcomingMovieNights.length > 0 ? (
            <div className="space-y-4">
              {upcomingMovieNights.map((movieNight) => (
                <div
                  key={movieNight.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedMovieNight(movieNight);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <div className="flex items-start gap-4">
                    {movieNight.imdb_id && (
                      <div className="w-16 h-24 flex-shrink-0">
                        <img
                          src={movieNight.movies?.[movieNight.imdb_id]?.Poster || '/placeholder-poster.jpg'}
                          alt="Selected movie poster"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {formatDate(movieNight.date)}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Upcoming
                            </span>
                          </div>
                          {movieNight.description && (
                            <p className="text-gray-600 mt-1">{movieNight.description}</p>
                          )}
                        </div>
                      </div>
                      {movieNight.imdb_id && (
                        <p className="text-sm text-gray-500 mt-2">
                          Selected: {movieNight.movies?.[movieNight.imdb_id]?.Title}
                        </p>
                      )}
                    </div>
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

          {pastMovieNights.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Movie Nights</h2>
              <div className="space-y-4">
                {pastMovieNights.map((movieNight) => (
                  <div
                    key={movieNight.id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedMovieNight(movieNight);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {movieNight.imdb_id && (
                        <div className="w-16 h-24 flex-shrink-0">
                          <img
                            src={movieNight.movies?.[movieNight.imdb_id]?.Poster || '/placeholder-poster.jpg'}
                            alt="Selected movie poster"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {formatDate(movieNight.date)}
                              </h3>
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                Past
                              </span>
                            </div>
                            {movieNight.description && (
                              <p className="text-gray-600 mt-1">{movieNight.description}</p>
                            )}
                          </div>
                        </div>
                        {movieNight.imdb_id && (
                          <p className="text-sm text-gray-500 mt-2">
                            Selected: {movieNight.movies?.[movieNight.imdb_id]?.Title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PlanMovieNightModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSubmit={handlePlanMovieNight}
        movieNightGroupId={movieNightGroup.id}
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
          onUpdate={handleMovieNightUpdated}
        />
      )}
    </div>
  );
} 