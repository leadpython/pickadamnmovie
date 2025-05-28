import { useState } from 'react';
import Image from 'next/image';
import MovieSearchModal from './MovieSearchModal';
import MovieDetailsModal from './MovieDetailsModal';
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
  description: string;
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

interface MovieNightDetailsModalProps {
  movieNight: MovieNight;
  onClose: () => void;
  onNominateMovie: (movie: Movie, movies: Record<string, Movie>) => void;
  onCancelMovieNight: () => void;
  onPickRandomMovie: () => void;
  hideActions?: boolean;
  showNominateButton?: boolean;
}

export default function MovieNightDetailsModal({
  movieNight,
  onClose,
  onNominateMovie,
  onCancelMovieNight,
  onPickRandomMovie,
  hideActions = false,
  showNominateButton = false,
}: MovieNightDetailsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isNominating, setIsNominating] = useState(false);
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [localMovies, setLocalMovies] = useState<Record<string, Movie> | null>(movieNight.movies);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [secret, setSecret] = useState('');
  const [showSecretInput, setShowSecretInput] = useState(false);
  const { sessionId } = useStore();
  const date = new Date(movieNight.date);
  const selectedMovie = movieNight.imdb_id ? localMovies?.[movieNight.imdb_id] : null;
  const nominatedMovies = localMovies ? Object.values(localMovies) : [];

  const handleCancelMovieNight = async () => {
    if (!confirm('Are you sure you want to cancel this movie night?')) return;
    setIsSubmitting(true);
    try {
      await onCancelMovieNight();
      onClose();
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
      // For public users, show secret input first
      setShowSecretInput(true);
      return;
    }

    // For authenticated users, proceed with nomination
    await submitNomination(movie);
  };

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim() || !selectedMovieId) return;

    // Get the movie details from the modal
    const movieDetails = await fetch(`/api/movie/${selectedMovieId}`).then(res => res.json());
    await submitNomination(movieDetails);
  };

  const submitNomination = async (movie: OMDBMovie) => {
    setIsNominating(true);
    try {
      // Determine which endpoint to use based on session type
      const endpoint = sessionId ? '/api/movie-night/nominate' : '/api/movie-night/nominate-public';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: sessionId,
          movie,
          secret: !sessionId ? secret : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to nominate movie');
      }

      const { movie: nominatedMovie, movies: updatedMovies } = await response.json();

      // Update local state with the new movies object
      setLocalMovies(updatedMovies);

      // Update the movie night in the parent component
      onNominateMovie(nominatedMovie, updatedMovies);
      setSelectedMovieId(null);
      setSecret(''); // Clear the secret after successful nomination
      setShowSecretInput(false); // Close the secret input modal
    } catch (error) {
      console.error('Error nominating movie:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsNominating(false);
    }
  };

  const handleViewMovieDetails = (movie: Movie) => {
    setSelectedMovieId(movie.imdb_id);
    setIsViewingDetails(true);
  };

  const handlePickRandomMovie = async () => {
    if (!localMovies || Object.keys(localMovies).length === 0) return;
    
    setIsPickingRandom(true);
    try {
      const response = await fetch('/api/movie-night/pick-random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: useStore.getState().sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to pick random movie');
      }

      const { selectedMovie, imdb_id } = await response.json();
      
      // Update local state with the selected movie
      setLocalMovies(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [imdb_id]: selectedMovie
        };
      });
      
      // Call the parent component's handler
      onPickRandomMovie();
    } catch (error) {
      console.error('Error picking random movie:', error);
    } finally {
      setIsPickingRandom(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-sm text-gray-500">
                  {date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Description</h4>
                <p className="mt-1 text-sm text-gray-600">{movieNight.description}</p>
              </div>

              {/* Selected Movie */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Movie</h4>
                {selectedMovie ? (
                  <div className="bg-gray-50 rounded-lg p-4">
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
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No movie selected yet</p>
                  </div>
                )}
              </div>

              {/* Nominated Movies */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Nominated Movies</h4>
                </div>
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
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No movies nominated yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              {!hideActions && (
                <>
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
                </>
              )}
              {showNominateButton && (
                <button
                  type="button"
                  onClick={handleSearchMovie}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Nominate Movie
                </button>
              )}
            </div>
          </div>
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

      {/* Secret Input Modal */}
      {showSecretInput && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Movie Night Secret</h3>
            <form onSubmit={handleSecretSubmit}>
              <div className="mb-4">
                <label htmlFor="secret" className="block text-sm font-medium text-gray-700">
                  Secret Code
                </label>
                <input
                  type="text"
                  id="secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter the movie night secret"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSecretInput(false);
                    setSelectedMovieId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isNominating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNominating ? 'Nominating...' : 'Nominate Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 