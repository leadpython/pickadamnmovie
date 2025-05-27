'use client';

import Logo from './Logo';
import { useState } from 'react';

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

interface MovieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export default function MovieDetailsModal({
  isOpen,
  onClose,
  movie,
  onSelect,
}: MovieDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelect = () => {
    setIsLoading(true);
    onSelect(movie);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <Logo className="mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">Movie Details</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            {movie.Poster !== 'N/A' ? (
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No poster available</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{movie.Title}</h3>
              <p className="text-gray-600">{movie.Year}</p>
            </div>

            {movie.Plot && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Plot</h4>
                <p className="text-gray-700">{movie.Plot}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {movie.Director && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Director</h4>
                  <p className="text-gray-900">{movie.Director}</p>
                </div>
              )}
              {movie.Actors && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Actors</h4>
                  <p className="text-gray-900">{movie.Actors}</p>
                </div>
              )}
              {movie.Genre && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Genre</h4>
                  <p className="text-gray-900">{movie.Genre}</p>
                </div>
              )}
              {movie.Runtime && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Runtime</h4>
                  <p className="text-gray-900">{movie.Runtime}</p>
                </div>
              )}
              {movie.Rated && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <p className="text-gray-900">{movie.Rated}</p>
                </div>
              )}
              {movie.imdbRating && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">IMDb Rating</h4>
                  <p className="text-gray-900">{movie.imdbRating}/10</p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleSelect}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {isLoading ? 'Selecting...' : 'Select Movie'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 