import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

interface MovieSearchModalProps {
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export default function MovieSearchModal({
  onClose,
  onSelectMovie,
}: MovieSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const searchMovies = async () => {
      if (!debouncedSearch) {
        setMovies([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/omdb/search?query=${encodeURIComponent(debouncedSearch)}&page=${page}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to search movies');
        }

        setMovies(data.Search || []);
        setTotalResults(parseInt(data.totalResults) || 0);
      } catch (error) {
        console.error('Search error:', error);
        setError(error instanceof Error ? error.message : 'Failed to search movies');
      } finally {
        setIsLoading(false);
      }
    };

    searchMovies();
  }, [debouncedSearch, page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Search Movies</h3>
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

        {/* Search Input */}
        <div className="px-6 py-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for a movie..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
            {isLoading && (
              <div className="absolute right-3 top-2">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6">
          {error ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : movies.length === 0 && !isLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No movies found' : 'Start typing to search movies'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {movies.map((movie) => (
                <div
                  key={movie.imdbID}
                  onClick={() => onSelectMovie(movie)}
                  className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-shrink-0 w-16 h-24 relative bg-gray-100 rounded overflow-hidden">
                    {movie.Poster !== 'N/A' ? (
                      <Image
                        src={movie.Poster}
                        alt={movie.Title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {movie.Title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {movie.Year} • {movie.Type}
                    </p>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {movies.length > 0 && movies.length < totalResults && (
                <div className="text-center py-4">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 