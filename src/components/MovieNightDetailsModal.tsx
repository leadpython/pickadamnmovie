'use client';

import Logo from './Logo';
import { deleteMovieNight, nominateMovie } from '@/services';
import { useState } from 'react';
import SearchMoviesModal from './SearchMoviesModal';

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

interface MovieNight {
  id: string;
  date: string;
  status: 'upcoming' | 'completed';
  movie?: string;
  description?: string;
  movies?: { [key: string]: Movie };
}

interface MovieNightDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieNight: MovieNight;
  onSelectMovie: (movieId: string) => void;
  onRandomSelect: () => void;
  onDelete: () => void;
  onUpdate: (updatedMovieNight: MovieNight) => void;
}

export default function MovieNightDetailsModal({
  isOpen,
  onClose,
  movieNight,
  onSelectMovie,
  onRandomSelect,
  onDelete,
  onUpdate,
}: MovieNightDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNominating, setIsNominating] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMovieNight(movieNight.id);
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting movie night:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMovieSelect = async (movie: Movie) => {
    setIsNominating(true);
    try {
      const response = await nominateMovie(movieNight.id, movie);
      onUpdate({
        ...movieNight,
        movies: response.movies
      });
      setIsSearchModalOpen(false);
    } catch (error) {
      console.error('Error nominating movie:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsNominating(false);
    }
  };

  const formattedDate = new Date(movieNight.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const nominatedMovies = movieNight.movies ? Object.values(movieNight.movies) : [];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex flex-col">
              <Logo className="mb-2 w-24 sm:w-auto" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Movie Night Details</h2>
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

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{formattedDate}</h3>
              {movieNight.description && (
                <p className="text-sm sm:text-base text-gray-600 mt-1">{movieNight.description}</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Selected Movie</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsSearchModalOpen(true)}
                      disabled={isNominating}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isNominating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }`}
                    >
                      {isNominating ? 'Nominating...' : 'Nominate Movie'}
                    </button>
                    <button
                      onClick={onRandomSelect}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Pick Random Movie
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isDeleting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      }`}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Movie Night'}
                    </button>
                  </div>
                </div>

                {movieNight.movie ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-base sm:text-lg font-medium text-gray-900">{movieNight.movie}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm sm:text-base text-gray-600">Nominated Movies</p>
                      <span className="text-xs sm:text-sm text-gray-500">{nominatedMovies.length} movies nominated</span>
                    </div>
                    
                    {nominatedMovies.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {nominatedMovies.map((movie) => (
                          <div
                            key={movie.imdbID}
                            className="bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex">
                              <div className="w-20 sm:w-24 h-28 sm:h-36 flex-shrink-0">
                                {movie.Poster !== 'N/A' ? (
                                  <img
                                    src={movie.Poster}
                                    alt={movie.Title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No poster</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow p-3 sm:p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{movie.Title}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{movie.Year}</p>
                                  </div>
                                </div>
                                {movie.Genre && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{movie.Genre}</p>
                                )}
                                {movie.Director && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Director:</span> {movie.Director}
                                  </p>
                                )}
                                {movie.imdbRating && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    <span className="font-medium">IMDb:</span> {movie.imdbRating}/10
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-500">No movies nominated yet.</p>
                        <button
                          onClick={() => setIsSearchModalOpen(true)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium"
                        >
                          Nominate your first movie →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchMoviesModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectMovie={handleMovieSelect}
      />
    </>
  );
} 