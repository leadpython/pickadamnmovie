'use client';

import { useState, useEffect } from 'react';
import { searchMovies, getMovieDetails } from '@/services';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';
import { Movie } from '@/types';
import Logo from '@/components/Logo';

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Logo className="w-full" />
          </div>

          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Movies</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a movie..."
                  className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={`px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSearching ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((movie) => (
                    <MovieCard
                      key={movie.imdbID}
                      movie={movie}
                      onClick={() => handleMovieClick(movie)}
                    />
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600 text-lg">Searching for movies...</span>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
} 