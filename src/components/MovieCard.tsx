import { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  className?: string;
}

export default function MovieCard({ movie, onClick, className = '' }: MovieCardProps) {
  return (
    <div 
      className={`flex items-start space-x-4 p-4 border rounded-lg ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {movie.Poster && movie.Poster !== 'N/A' && (
        <img 
          src={movie.Poster} 
          alt={movie.Title}
          className="w-24 h-auto rounded-lg shadow-md"
        />
      )}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{movie.Title}</h4>
        <p className="text-gray-600">{movie.Year}</p>
        {movie.Genre && (
          <p className="text-gray-600 mt-1">{movie.Genre}</p>
        )}
        {movie.Director && (
          <p className="text-gray-600 mt-1">
            <span className="font-medium">Director:</span> {movie.Director}
          </p>
        )}
        {movie.imdbRating && (
          <p className="text-gray-600 mt-1">
            <span className="font-medium">IMDb:</span> {movie.imdbRating}/10
          </p>
        )}
      </div>
    </div>
  );
} 