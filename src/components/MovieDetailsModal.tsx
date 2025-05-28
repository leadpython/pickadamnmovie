'use client';

import Logo from './Logo';
import { Movie } from '@/types';

interface MovieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  onSelect: (movie: Movie) => void;
  showSelectButton?: boolean;
}

export default function MovieDetailsModal({
  isOpen,
  onClose,
  movie,
  onSelect,
  showSelectButton = false,
}: MovieDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex flex-col">
            <Logo className="mb-2 w-24 sm:w-auto" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Movie Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            {movie.Poster && movie.Poster !== 'N/A' ? (
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No poster available</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{movie.Title}</h3>
              <p className="text-gray-600">{movie.Year}</p>
            </div>

            {movie.Plot && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Plot</h4>
                <p className="text-gray-600">{movie.Plot}</p>
              </div>
            )}

            {movie.Director && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Director</h4>
                <p className="text-gray-600">{movie.Director}</p>
              </div>
            )}

            {movie.Actors && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Cast</h4>
                <p className="text-gray-600">{movie.Actors}</p>
              </div>
            )}

            {movie.Genre && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Genre</h4>
                <p className="text-gray-600">{movie.Genre}</p>
              </div>
            )}

            {movie.Runtime && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Runtime</h4>
                <p className="text-gray-600">{movie.Runtime}</p>
              </div>
            )}

            {movie.Rated && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Rating</h4>
                <p className="text-gray-600">{movie.Rated}</p>
              </div>
            )}

            {movie.imdbRating && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">IMDb Rating</h4>
                <p className="text-gray-600">{movie.imdbRating}/10</p>
              </div>
            )}
          </div>
        </div>

        {showSelectButton && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => onSelect(movie)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Select Movie
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 