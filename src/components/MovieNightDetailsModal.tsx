'use client';

import Logo from './Logo';
import { deleteMovieNight, nominateMovie, getMovieDetails } from '@/services';
import { useState, useEffect } from 'react';
import SearchMoviesModal from './SearchMoviesModal';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';
import { Movie, MovieNight } from '@/types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

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
  const [isRandomSelecting, setIsRandomSelecting] = useState(false);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const now = new Date();
  const isPastMovieNight = new Date(movieNight.date) < now;

  useEffect(() => {
    const fetchSelectedMovie = async () => {
      if (movieNight.imdb_id) {
        try {
          const movieData = await getMovieDetails(movieNight.imdb_id);
          setSelectedMovieDetails(movieData);
        } catch (error) {
          console.error('Error fetching selected movie details:', error);
        }
      } else {
        setSelectedMovieDetails(null);
      }
    };

    fetchSelectedMovie();
  }, [movieNight.imdb_id]);

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

  const handleRandomSelect = async () => {
    setIsRandomSelecting(true);
    try {
      await onRandomSelect();
    } finally {
      setIsRandomSelecting(false);
    }
  };

  const handleMovieClick = async (movie: Movie) => {
    try {
      const details = await getMovieDetails(movie.imdbID);
      setSelectedMovie(details);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const nominatedMovies = movieNight.movies ? Object.values(movieNight.movies) : [];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-4xl">
            <div className="bg-white px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {formatDate(movieNight.date)}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    isPastMovieNight 
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isPastMovieNight ? 'Past' : 'Upcoming'}
                  </span>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {movieNight.description && (
                <p className="mt-1 text-sm text-gray-600">{movieNight.description}</p>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Movie</h4>
                  {movieNight.imdb_id ? (
                    <div className="flex items-start gap-3">
                      {(() => {
                        const selectedMovie = movieNight.movies && movieNight.imdb_id ? movieNight.movies[movieNight.imdb_id] : null;
                        return (
                          <>
                            <img
                              src={selectedMovie?.Poster || '/placeholder-poster.jpg'}
                              alt="Selected movie poster"
                              className="w-20 h-28 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => selectedMovie && handleMovieClick(selectedMovie)}
                            />
                            <div>
                              <h5 className="text-base font-medium text-gray-900">
                                {selectedMovie?.Title}
                              </h5>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {selectedMovie?.Year}
                              </p>
                              <button
                                onClick={() => selectedMovie && handleMovieClick(selectedMovie)}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                              >
                                View Details
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No movie selected yet</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Nominated Movies</h4>
                  {Object.keys(movieNight.movies || {}).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Object.entries(movieNight.movies || {}).map(([imdbId, movie]) => (
                        <div
                          key={imdbId}
                          className={`relative rounded-lg overflow-hidden aspect-[2/3] ${
                            imdbId === movieNight.imdb_id ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <img
                            src={movie.Poster || '/placeholder-poster.jpg'}
                            alt={movie.Title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-opacity duration-200">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                              {isPastMovieNight ? (
                                <button
                                  onClick={() => handleMovieClick(movie)}
                                  className="px-3 py-1.5 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                                >
                                  View Details
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMovieClick(movie)}
                                  className="px-3 py-1.5 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                                >
                                  Select
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white text-sm font-medium truncate">{movie.Title}</p>
                            <p className="text-white/80 text-xs">{movie.Year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No movies nominated yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {!isPastMovieNight && (
                <>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Canceling...' : 'Cancel Movie Night'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => setIsSearchModalOpen(true)}
                    disabled={isNominating}
                  >
                    {isNominating ? 'Nominating...' : 'Nominate Movie'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                    onClick={handleRandomSelect}
                    disabled={isRandomSelecting || nominatedMovies.length === 0}
                  >
                    {isRandomSelecting ? 'Selecting...' : 'Select Random Movie'}
                  </button>
                </>
              )}
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <SearchMoviesModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectMovie={handleMovieSelect}
      />

      {selectedMovie && (
        <MovieDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedMovie(null);
          }}
          movie={selectedMovie}
          onSelect={handleMovieSelect}
          showSelectButton={false}
        />
      )}
    </>
  );
} 