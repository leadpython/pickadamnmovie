'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import MovieSearchModal from '@/components/MovieSearchModal';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import { useStore } from '@/store/store';

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

interface OMDBMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Ratings?: { Source: string; Value: string }[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
}

export default function MovieNightDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { sessionId } = useStore();
  const [movieNight, setMovieNight] = useState<MovieNight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isNominating, setIsNominating] = useState(false);
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [localMovies, setLocalMovies] = useState<Record<string, Movie> | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  const movieNightId = params.id as string;

  useEffect(() => {
    const fetchMovieNight = async () => {
      if (!sessionId || !movieNightId) {
        router.push('/main');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/movie-night/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieNightId,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch movie night');
        }

        const data = await response.json();
        setMovieNight(data);
        setLocalMovies(data.movies);
      } catch (error) {
        console.error('Error fetching movie night:', error);
        setError('Failed to load movie night');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieNight();
  }, [movieNightId, sessionId, router]);

  const handleCancelMovieNight = async () => {
    if (!movieNight || !confirm('Are you sure you want to cancel this movie night?')) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/movie-night/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel movie night');
      }

      router.push('/main');
    } catch (error) {
      console.error('Error canceling movie night:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchMovie = () => {
    setIsSearchModalOpen(true);
  };

  const handleSelectMovie = (movie: OMDBMovie) => {
    setSelectedMovieId(movie.imdbID);
    setIsSearchModalOpen(false);
  };

  const handleNominateMovie = async (movie: OMDBMovie) => {
    if (!sessionId) {
      alert('You must be logged in to nominate movies.');
      return;
    }

    await submitNomination(movie);
  };

  const submitNomination = async (movie: OMDBMovie) => {
    if (!movieNight) return;
    
    try {
      const response = await fetch('/api/movie-night/nominate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: sessionId,
          movie,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to nominate movie');
      }

      const { movies: updatedMovies } = await response.json();

      setLocalMovies(updatedMovies);
      setMovieNight(prev => prev ? { ...prev, movies: updatedMovies } : null);
      setSelectedMovieId(null);
    } catch (error) {
      console.error('Error nominating movie:', error);
      throw error;
    }
  };

  const handleViewMovieDetails = (movie: Movie) => {
    setSelectedMovieId(movie.imdb_id);
    setIsViewingDetails(true);
  };

  const handlePickRandomMovie = async () => {
    if (!localMovies || Object.keys(localMovies).length === 0 || !movieNight) return;
    
    setIsPickingRandom(true);
    try {
      const response = await fetch('/api/movie-night/pick-random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to pick random movie');
      }

      const { selectedMovie, imdb_id } = await response.json();
      
      setLocalMovies(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [imdb_id]: selectedMovie
        };
      });
      
      setMovieNight(prev => prev ? { ...prev, imdb_id } : null);
    } catch (error) {
      console.error('Error picking random movie:', error);
    } finally {
      setIsPickingRandom(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !movieNight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || 'Movie night not found'}</div>
      </div>
    );
  }

  const date = new Date(movieNight.date);
  const selectedMovie = movieNight.imdb_id ? localMovies?.[movieNight.imdb_id] : null;
  const nominatedMovies = localMovies ? Object.values(localMovies) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/main')}
                className="text-gray-400 hover:text-gray-500 mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h1>
                <p className="text-sm text-gray-500">
                  {date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Selected Movie */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Movie</h4>
              {selectedMovie ? (
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-24 h-36 relative rounded overflow-hidden">
                      <Image
                        src={selectedMovie.poster_url}
                        alt={selectedMovie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-base font-medium text-gray-900">{selectedMovie.title}</h5>
                      <p className="text-sm text-gray-500">
                        {selectedMovie.year} • {selectedMovie.runtime} min
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">No movie selected yet</p>
                </div>
              )}
            </div>

            {/* Nominated Movies */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Nominated Movies</h3>
                <button
                  type="button"
                  onClick={handleSearchMovie}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Nominate Movie
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {nominatedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {nominatedMovies.map((movie) => (
                      <button
                        key={movie.imdb_id}
                        onClick={() => handleViewMovieDetails(movie)}
                        className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-left ${
                          movie.imdb_id === movieNight.imdb_id ? 'ring-2 ring-indigo-500' : ''
                        }`}
                      >
                        <div className="aspect-[2/3] relative rounded-t-lg overflow-hidden">
                          <Image
                            src={movie.poster_url === 'N/A' ? '/movie-placeholder.svg' : movie.poster_url}
                            alt={movie.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                        </div>
                        <div className="p-3">
                          <h5 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-200">
                            {movie.title}
                          </h5>
                          <p className="text-xs text-gray-500 mt-1">
                            {movie.year} • {movie.runtime} min
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow-sm rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No movies nominated yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button
            type="button"
            onClick={handleCancelMovieNight}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Canceling...' : 'Cancel Movie Night'}
          </button>
          <button
            type="button"
            onClick={handlePickRandomMovie}
            disabled={isPickingRandom || !localMovies || Object.keys(localMovies).length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPickingRandom ? 'Picking...' : 'Pick Random Movie'}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isPickingRandom && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Picking a random movie...</p>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchModalOpen && (
        <MovieSearchModal
          onClose={() => setIsSearchModalOpen(false)}
          onSelectMovie={handleSelectMovie}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovieId && (
        <MovieDetailsModal
          imdbId={selectedMovieId}
          onClose={() => {
            setSelectedMovieId(null);
            setIsViewingDetails(false);
          }}
          onNominate={isViewingDetails ? undefined : handleNominateMovie}
          isNominating={isNominating}
        />
      )}
    </div>
  );
} 