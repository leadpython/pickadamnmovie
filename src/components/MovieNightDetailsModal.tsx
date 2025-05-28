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

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Date</h3>
              <p className="text-gray-600">{formatDate(movieNight.date)}</p>
            </div>

            {movieNight.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-gray-600">{movieNight.description}</p>
              </div>
            )}

            {selectedMovieDetails ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Selected Movie</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <MovieCard 
                    movie={selectedMovieDetails} 
                    className="bg-yellow-50"
                    onClick={() => handleMovieClick(selectedMovieDetails)}
                  />
                </div>
              </div>
            ) : movieNight.imdb_id ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Selected Movie</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center justify-center p-8 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-600">Loading movie details...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nominated Movies</h3>
              {nominatedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {nominatedMovies.map((movie) => (
                    <MovieCard 
                      key={movie.imdbID} 
                      movie={movie}
                      onClick={() => handleMovieClick(movie)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-2">No movies nominated yet.</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  disabled={isNominating}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isNominating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isNominating ? 'Nominating...' : 'Nominate Movie'}
                </button>
                <button
                  onClick={handleRandomSelect}
                  disabled={isRandomSelecting || nominatedMovies.length === 0}
                  className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    (isRandomSelecting || nominatedMovies.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isRandomSelecting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Selecting...</span>
                    </div>
                  ) : (
                    'Pick Random Movie'
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Canceling...' : 'Cancel Movie Night'}
                </button>
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