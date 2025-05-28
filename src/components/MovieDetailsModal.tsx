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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full bg-white overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Logo className="w-full" />
          </div>

          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Movie Details</h2>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <img
                    src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-poster.jpg'}
                    alt={movie.Title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{movie.Title}</h3>
                  <p className="text-gray-600 text-lg mb-4">{movie.Year}</p>
                  
                  {movie.Plot && (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Plot</h4>
                      <p className="text-gray-600 text-lg">{movie.Plot}</p>
                    </div>
                  )}

                  {movie.Director && (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Director</h4>
                      <p className="text-gray-600 text-lg">{movie.Director}</p>
                    </div>
                  )}

                  {movie.Actors && (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Cast</h4>
                      <p className="text-gray-600 text-lg">{movie.Actors}</p>
                    </div>
                  )}

                  {showSelectButton && (
                    <button
                      onClick={() => onSelect(movie)}
                      className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Select Movie
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 