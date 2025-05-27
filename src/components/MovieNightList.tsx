import { useState } from 'react';
import { MovieNight } from '@/types';
import { deleteMovieNight, fetchUpcomingMovieNights } from '@/services';
import { useStore } from '@/store/store';

interface MovieNightListProps {
  movieNights: MovieNight[];
  onMovieNightsChange: (movieNights: MovieNight[]) => void;
}

export default function MovieNightList({ movieNights, onMovieNightsChange }: MovieNightListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const movieNightGroup = useStore(state => state.movieNightGroup);

  const handleDelete = async (movieNightId: string) => {
    if (!movieNightGroup) return;
    
    setIsDeleting(movieNightId);
    try {
      await deleteMovieNight(movieNightId);
      // Refetch the updated list
      const updatedMovieNights = await fetchUpcomingMovieNights(movieNightGroup.id);
      onMovieNightsChange(updatedMovieNights);
    } catch (error) {
      console.error('Error deleting movie night:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(null);
    }
  };

  if (movieNights.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No upcoming movie nights scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {movieNights.map((movieNight) => (
        <div
          key={movieNight.id}
          className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {new Date(movieNight.date).toLocaleDateString()}
            </h3>
            <p className="text-gray-600">{movieNight.description}</p>
          </div>
          <button
            onClick={() => handleDelete(movieNight.id)}
            disabled={isDeleting === movieNight.id}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isDeleting === movieNight.id
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isDeleting === movieNight.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
} 