'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import Image from 'next/image';

interface MovieNight {
  id: string;
  date: string;
  imdb_id: string | null;
  movies: any[] | null;
  description: string;
}

// Mock data for development
const mockMovieNights: MovieNight[] = [
  // Past movie nights
  {
    id: 'past1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    imdb_id: 'tt0111161',
    movies: [
      {
        imdb_id: 'tt0111161',
        title: 'The Shawshank Redemption',
        year: 1994,
        runtime: 142,
        poster_url: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg'
      }
    ],
    description: 'Classic movie night with The Shawshank Redemption.'
  },
  {
    id: 'past2',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    imdb_id: 'tt0468569',
    movies: [
      {
        imdb_id: 'tt0468569',
        title: 'The Dark Knight',
        year: 2008,
        runtime: 152,
        poster_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'
      }
    ],
    description: 'Superhero movie night with The Dark Knight.'
  },
  {
    id: 'past3',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    imdb_id: 'tt0110912',
    movies: [
      {
        imdb_id: 'tt0110912',
        title: 'Pulp Fiction',
        year: 1994,
        runtime: 154,
        poster_url: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
      }
    ],
    description: 'Classic Tarantino night with Pulp Fiction.'
  },
  // Upcoming movie nights
  {
    id: 'upcoming1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    imdb_id: 'tt0111161',
    movies: [
      {
        imdb_id: 'tt0111161',
        title: 'The Shawshank Redemption',
        year: 1994,
        runtime: 142,
        poster_url: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg'
      }
    ],
    description: 'Our weekly movie night! Bring your favorite snacks and drinks.'
  },
  {
    id: 'upcoming2',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    imdb_id: null,
    movies: [
      {
        imdb_id: 'tt0468569',
        title: 'The Dark Knight',
        year: 2008,
        runtime: 152,
        poster_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'
      },
      {
        imdb_id: 'tt0110912',
        title: 'Pulp Fiction',
        year: 1994,
        runtime: 154,
        poster_url: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
      }
    ],
    description: 'Superhero movie night! Vote for your favorite between The Dark Knight and Pulp Fiction.'
  }
];

export default function MainPage() {
  const router = useRouter();
  const { sessionId, group, isHydrated } = useStore();
  const [isValidating, setIsValidating] = useState(true);
  const [movieNights, setMovieNights] = useState<MovieNight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      console.log('Starting session validation:', { sessionId, group, isHydrated });

      // Wait for hydration to complete
      if (!isHydrated) {
        console.log('Waiting for store hydration...');
        return;
      }

      // If no session in store, redirect to login
      if (!sessionId || !group) {
        console.log('No session found in store, redirecting to login');
        router.push('/');
        return;
      }

      try {
        console.log('Making API request to validate session...');
        // Validate session through API
        const response = await fetch('/api/session/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.valid) {
          console.log('Session is valid, setting isValidating to false');
          setIsValidating(false);
          // Use mock data for now
          setMovieNights(mockMovieNights);
          setIsLoading(false);
        } else {
          console.log('Session validation failed:', data.error);
          router.push('/');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        router.push('/');
      }
    };

    validateSession();
  }, [sessionId, group, isHydrated, router]);

  // Show loading state while validating or waiting for hydration
  if (!isHydrated || isValidating || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render anything if no session
  if (!sessionId || !group) {
    return null;
  }

  // Separate past and upcoming movie nights
  const now = new Date();
  const upcomingMovieNights = movieNights.filter(mn => new Date(mn.date) > now);
  const pastMovieNights = movieNights.filter(mn => new Date(mn.date) <= now);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Branding */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image
                  src="/pickadamnmovie.png"
                  alt="PickADamnMovie"
                  width={180}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </div>
              <div className="hidden md:block ml-6">
                <div className="flex items-baseline space-x-4">
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-900 font-medium">{group.name}</span>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                New Movie Night
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  useStore.getState().clearSession();
                  router.push('/');
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Upcoming Movie Nights */}
          <div className="mb-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Movie Nights</h2>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {upcomingMovieNights.map((movieNight) => {
                const date = new Date(movieNight.date);
                const selectedMovie = movieNight.imdb_id ? movieNight.movies?.find(m => m.imdb_id === movieNight.imdb_id) : null;
                const status = selectedMovie ? 'Movie Selected' : movieNight.movies ? 'Voting' : 'No Movies';

                return (
                  <div
                    key={movieNight.id}
                    className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-3">
                      <div className="flex items-center space-x-3">
                        {/* Movie Poster Placeholder */}
                        <div className="flex-shrink-0 w-16 h-24 relative bg-gray-100 rounded overflow-hidden border border-gray-200">
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                            <div className="w-6 h-6 mb-1">
                              <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
                            <span className="text-[10px] text-gray-500 text-center">
                              {selectedMovie ? 'Selected' : 'No Movie'}
                            </span>
                          </div>
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
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              status === 'Movie Selected' 
                                ? 'bg-green-100 text-green-800'
                                : status === 'Voting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {status}
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

                          <p className="mt-1 text-xs text-gray-600 line-clamp-1">
                            {movieNight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {upcomingMovieNights.length === 0 && (
                <div className="text-center py-8">
                  <h3 className="text-sm font-medium text-gray-900">No upcoming movie nights</h3>
                  <p className="mt-1 text-xs text-gray-500">Get started by creating your first movie night!</p>
                </div>
              )}
            </div>
          </div>

          {/* Past Movie Nights */}
          {pastMovieNights.length > 0 && (
            <div className="mt-6">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-lg font-semibold text-gray-900">Past Movie Nights</h2>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {pastMovieNights.map((movieNight) => {
                  const date = new Date(movieNight.date);
                  const selectedMovie = movieNight.imdb_id ? movieNight.movies?.find(m => m.imdb_id === movieNight.imdb_id) : null;

                  return (
                    <div
                      key={movieNight.id}
                      className="bg-white/50 shadow-sm rounded overflow-hidden hover:bg-white/80 transition-colors duration-200"
                    >
                      <div className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          {/* Tiny Movie Poster Placeholder */}
                          <div className="flex-shrink-0 w-8 h-12 relative bg-gray-100 rounded overflow-hidden border border-gray-200">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 