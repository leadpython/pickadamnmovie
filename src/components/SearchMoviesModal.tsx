'use client';

import { useState, useEffect } from 'react';
import Logo from './Logo';
import { searchMovies, getMovieDetails } from '@/services';
import MovieDetailsModal from './MovieDetailsModal';

interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  Runtime?: string;
  Rated?: string;
  imdbRating?: string;
}

interface SearchMoviesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export default function SearchMoviesModal({
  isOpen,
  onClose,
  onSelectMovie,
}: SearchMoviesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setMovies([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchMovies(searchQuery);
        setMovies(response.Search || []);
      } catch (error) {
        setError('Failed to search movies. Please try again.');
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleMovieClick = async (movie: Movie) => {
    setIsLoadingDetails(true);
    try {
      const details = await getMovieDetails(movie.imdbID);
      setSelectedMovie(details);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    onSelectMovie(movie);
    setIsDetailsModalOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <Logo className="mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Search Movies</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-center py-4">
                {error}
              </div>
            )}

            {!isLoading && !error && movies.length > 0 && (
              <div className="grid gap-4">
                {movies.map((movie) => (
                  <button
                    key={movie.imdbID}
                    onClick={() => handleMovieClick(movie)}
                    disabled={isLoadingDetails}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-20 h-28 flex-shrink-0">
                      {movie.Poster !== 'N/A' ? (
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No poster</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow text-left">
                      <h3 className="font-medium text-gray-900">{movie.Title}</h3>
                      <p className="text-sm text-gray-600">{movie.Year}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && !error && searchQuery && movies.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No movies found. Try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMovie && (
        <MovieDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          movie={selectedMovie}
          onSelect={handleSelectMovie}
        />
      )}
    </>
  );
} 