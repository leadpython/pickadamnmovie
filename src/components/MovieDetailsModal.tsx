import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MovieDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
}

interface MovieDetailsModalProps {
  imdbId: string;
  onClose: () => void;
  onNominate: (movie: MovieDetails) => void;
  isNominating: boolean;
}

export default function MovieDetailsModal({
  imdbId,
  onClose,
  onNominate,
  isNominating,
}: MovieDetailsModalProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/omdb/details?imdbId=${imdbId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch movie details');
        }

        setMovie(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch movie details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [imdbId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Loading movie details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">{error || 'Movie not found'}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Movie Details</h3>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : movie ? (
            <div className="space-y-6">
              {/* Movie Poster and Basic Info */}
              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-48 h-72 relative rounded-lg overflow-hidden">
                  <Image
                    src={movie.Poster === 'N/A' ? '/movie-placeholder.svg' : movie.Poster}
                    alt={movie.Title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{movie.Title}</h4>
                  <p className="text-gray-500">
                    {movie.Year} • {movie.Runtime} • {movie.Rated}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p><span className="font-medium">Genre:</span> {movie.Genre}</p>
                    <p><span className="font-medium">Director:</span> {movie.Director}</p>
                    <p><span className="font-medium">Writer:</span> {movie.Writer}</p>
                    <p><span className="font-medium">Actors:</span> {movie.Actors}</p>
                  </div>
                </div>
              </div>

              {/* Plot */}
              <div>
                <h5 className="font-medium text-gray-900">Plot</h5>
                <p className="mt-1 text-gray-600">{movie.Plot}</p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900">Additional Information</h5>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Language:</span> {movie.Language}</p>
                    <p><span className="font-medium">Country:</span> {movie.Country}</p>
                    <p><span className="font-medium">Awards:</span> {movie.Awards}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Ratings</h5>
                  <div className="mt-2 space-y-1">
                    {movie.Ratings.map((rating, index) => (
                      <p key={index}>
                        <span className="font-medium">{rating.Source}:</span> {rating.Value}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onNominate(movie!)}
              disabled={isNominating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNominating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Nominating...
                </>
              ) : (
                'Nominate Movie'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 