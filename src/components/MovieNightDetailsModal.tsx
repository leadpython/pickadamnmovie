'use client';

import Logo from './Logo';

interface Movie {
  id: string;
  title: string;
  nominatedBy: string;
}

interface MovieNight {
  id: string;
  date: string;
  status: 'upcoming' | 'completed';
  movie?: string;
  description?: string;
  nominatedMovies?: Movie[];
}

interface MovieNightDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieNight: MovieNight;
  onSelectMovie: (movieId: string) => void;
  onRandomSelect: () => void;
}

export default function MovieNightDetailsModal({
  isOpen,
  onClose,
  movieNight,
  onSelectMovie,
  onRandomSelect,
}: MovieNightDetailsModalProps) {
  if (!isOpen) return null;

  const formattedDate = new Date(movieNight.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <Logo className="mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">Movie Night Details</h2>
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

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{formattedDate}</h3>
            {movieNight.description && (
              <p className="text-gray-600 mt-1">{movieNight.description}</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Selected Movie</h3>
              <button
                onClick={onRandomSelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Pick Random Movie
              </button>
            </div>

            {movieNight.movie ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">{movieNight.movie}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">No movie selected yet. Choose from the nominations below:</p>
                {movieNight.nominatedMovies && movieNight.nominatedMovies.length > 0 ? (
                  <div className="grid gap-3">
                    {movieNight.nominatedMovies.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => onSelectMovie(movie.id)}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-900">{movie.title}</span>
                        <span className="text-sm text-gray-500">Nominated by {movie.nominatedBy}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No movies nominated yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 