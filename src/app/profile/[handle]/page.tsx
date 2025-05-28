'use client';

import { useEffect, useState } from 'react';
import MovieNightDetailsModal from '@/components/MovieNightDetailsModal';

interface Movie {
  imdb_id: string;
  title: string;
  year: number;
  runtime: number;
  poster_url: string;
  rated?: string;
  released?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  ratings?: { Source: string; Value: string }[];
  metascore?: string;
  imdb_rating?: string;
  imdb_votes?: string;
  type?: string;
  dvd?: string;
  box_office?: string;
  production?: string;
  website?: string;
}

interface MovieNight {
  id: string;
  date: string;
  imdb_id: string | null;
  movies: Record<string, Movie> | null;
  description: string;
  movie_night_group_id: string;
}

interface MovieNightGroup {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  created_at: string;
}

export default function ProfilePage({ params }: { params: { handle: string } }) {
  const [group, setGroup] = useState<MovieNightGroup | null>(null);
  const [movieNights, setMovieNights] = useState<MovieNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovieNight, setSelectedMovieNight] = useState<MovieNight | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch movie night group data
        const response = await fetch(`/api/movie-night-group/${params.handle}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movie night group');
        }
        const data = await response.json();
        setGroup(data.group);
        setMovieNights(data.movieNights);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load movie night group');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.handle]);

  const handleNominateMovie = (movie: Movie, movies: Record<string, Movie>) => {
    if (selectedMovieNight) {
      setMovieNights(prevNights =>
        prevNights.map(night =>
          night.id === selectedMovieNight.id
            ? { ...night, movies }
            : night
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Movie night group not found</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingNights = movieNights.filter(night => new Date(night.date) > new Date());
  const pastNights = movieNights.filter(night => new Date(night.date) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Group Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          {group.description && (
            <p className="mt-2 text-gray-600">{group.description}</p>
          )}
        </div>

        {/* Movie Nights */}
        <div className="space-y-8">
          {/* Upcoming Movie Nights */}
          {upcomingNights.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Movie Nights</h2>
              <div className="grid grid-cols-1 gap-4">
                {upcomingNights.map((night) => (
                  <button
                    key={night.id}
                    onClick={() => setSelectedMovieNight(night)}
                    className="bg-white shadow rounded-lg p-6 text-left hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {new Date(night.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(night.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Upcoming
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{night.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Past Movie Nights */}
          {pastNights.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Movie Nights</h2>
              <div className="grid grid-cols-1 gap-4">
                {pastNights.map((night) => (
                  <button
                    key={night.id}
                    onClick={() => setSelectedMovieNight(night)}
                    className="bg-white shadow rounded-lg p-6 text-left hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {new Date(night.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(night.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Past
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{night.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {movieNights.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No movie nights scheduled yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Movie Night Details Modal */}
      {selectedMovieNight && (
        <MovieNightDetailsModal
          movieNight={selectedMovieNight}
          onClose={() => setSelectedMovieNight(null)}
          onNominateMovie={handleNominateMovie}
          onCancelMovieNight={() => {}}
          onPickRandomMovie={() => {}}
          hideActions={true}
          showNominateButton={true}
        />
      )}
    </div>
  );
}
