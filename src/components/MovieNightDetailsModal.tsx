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

interface MovieNightDetailsModalProps {
  movieNight: MovieNight;
  onClose: () => void;
  onNominateMovie: (movie: Movie, movies: Record<string, Movie>) => void;
  onCancelMovieNight: () => void;
  onPickRandomMovie: () => void;
}

export default function MovieNightDetailsModal({
  movieNight,
  onClose,
  onNominateMovie,
  onCancelMovieNight,
  onPickRandomMovie,
}: MovieNightDetailsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isNominating, setIsNominating] = useState(false);
  const [localMovies, setLocalMovies] = useState<Record<string, Movie> | null>(movieNight.movies);
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

  const handleSelectMovie = (movie: any) => {
    setSelectedMovieId(movie.imdbID);
    setIsSearchModalOpen(false);
  };

  const handleNominateMovie = async (movie: any) => {
    setIsNominating(true);
    try {
      const response = await fetch('/api/movie-night/nominate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: useStore.getState().sessionId,
          movie,
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
    } catch (error) {
      console.error('Error nominating movie:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsNominating(false);
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
                  <button
                    type="button"
                    onClick={handleSearchMovie}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Nominate Movie
                  </button>
                </div>
                {nominatedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {nominatedMovies.map((movie) => (
                      <div
                        key={movie.imdb_id}
                        className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
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
                      </div>
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
                onClick={onPickRandomMovie}
                disabled={!movieNight.movies || Object.keys(movieNight.movies).length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pick Random Movie
              </button>
            </div>
          </div>
        </div>
      </div>

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
          onClose={() => setSelectedMovieId(null)}
          onNominate={handleNominateMovie}
          isNominating={isNominating}
        />
      )}
    </>
  );
} 