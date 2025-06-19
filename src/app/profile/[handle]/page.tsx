'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  movie_night_group_id: string;
}

interface MovieNightGroup {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  created_at: string;
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const router = useRouter();
  const [group, setGroup] = useState<MovieNightGroup | null>(null);
  const [movieNights, setMovieNights] = useState<MovieNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { handle: resolvedHandle } = await params;
        setHandle(resolvedHandle);
        // Fetch movie night group data
        const response = await fetch(`/api/movie-night-group/${resolvedHandle}`);
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
  }, [params]);

  const handleMovieNightClick = (movieNightId: string) => {
    router.push(`/profile/${handle}/movie-night/${movieNightId}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* App Branding Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/pickadamnmovie.png"
                alt="Pick a Damn Movie"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Group Info */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
            <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
            {group.description && (
              <p className="mt-1 text-sm text-gray-600">{group.description}</p>
            )}
          </div>

          {/* Movie Nights */}
          <div className="space-y-6">
            {/* Upcoming Movie Nights */}
            {upcomingNights.length > 0 && (
              <div>
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Movie Nights</h2>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {upcomingNights.map((night) => {
                    const date = new Date(night.date);
                    const selectedMovie = night.imdb_id && night.movies ? night.movies[night.imdb_id] : null;

                    return (
                      <button
                        key={night.id}
                        onClick={() => handleMovieNightClick(night.id)}
                        className="w-full bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 text-left"
                      >
                        <div className="p-3">
                          <div className="flex items-center space-x-3">
                            {/* Movie Poster */}
                            <div className="flex-shrink-0 w-16 h-24 relative rounded overflow-hidden border border-gray-200">
                              {selectedMovie ? (
                                <Image
                                  src={selectedMovie.poster_url}
                                  alt={selectedMovie.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-gray-100">
                                  <div className="w-6 h-6 mb-1">
                                    <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                  </div>
                                  <span className="text-[10px] text-gray-500 text-center">
                                    No Movie
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Movie Night Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {date.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {date.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Upcoming
                                </span>
                              </div>

                              <div className="mt-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {selectedMovie ? selectedMovie.title : 'No movie selected yet'}
                                </h4>
                                {selectedMovie && (
                                  <p className="text-xs text-gray-500">
                                    {selectedMovie.year} • {selectedMovie.runtime} min
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Movie Nights */}
            {pastNights.length > 0 && (
              <div>
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h2 className="text-lg font-semibold text-gray-900">Past Movie Nights</h2>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {pastNights.map((night) => {
                    const date = new Date(night.date);
                    const selectedMovie = night.imdb_id && night.movies ? night.movies[night.imdb_id] : null;

                    return (
                      <button
                        key={night.id}
                        onClick={() => handleMovieNightClick(night.id)}
                        className="w-full bg-white/50 shadow-sm rounded overflow-hidden hover:bg-white/80 transition-colors duration-200 text-left"
                      >
                        <div className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            {/* Tiny Movie Poster */}
                            <div className="flex-shrink-0 w-8 h-12 relative rounded overflow-hidden border border-gray-200">
                              {selectedMovie ? (
                                <Image
                                  src={selectedMovie.poster_url}
                                  alt={selectedMovie.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Movie Night Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-600">
                                    {date.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {date.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600 truncate ml-2">
                                  {selectedMovie ? selectedMovie.title : 'No movie selected'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {movieNights.length === 0 && (
              <div className="text-center py-8">
                <h3 className="text-sm font-medium text-gray-900">No movie nights scheduled yet</h3>
                <p className="mt-1 text-xs text-gray-500">Get started by creating your first movie night!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
