'use client';

import { useState, useEffect } from 'react';
import { searchMovies, getMovieDetails } from '@/services';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';
import { Movie } from '@/types';

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
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results['Search']);
      } catch (error) {
        setError('Failed to search movies. Please try again.');
        console.error('Error searching movies:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleMovieClick = async (movie: Movie) => {
    try {
      const details = await getMovieDetails(movie.imdbID);
      setSelectedMovie(details);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Search Movies</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isSearching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={() => handleMovieClick(movie)}
              />
            ))}
          </div>

          {searchResults.length === 0 && !isSearching && searchQuery && (
            <p className="text-center text-gray-500 mt-4">No movies found.</p>
          )}
        </div>
      </div>

      {selectedMovie && (
        <MovieDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedMovie(null);
          }}
          movie={selectedMovie}
          onSelect={onSelectMovie}
          showSelectButton={true}
        />
      )}
    </>
  );
} 