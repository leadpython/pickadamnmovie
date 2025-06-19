'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface Movie {
  imdb_id: string;
  title: string;
  year: number;
  runtime: number;
  poster_url: string;
  rated?: string;
  released?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  ratings?: { Source: string; Value: string }[];
  metascore?: string;
  imdb_rating?: string;
  imdb_votes?: string;
  type?: string;
  dvd?: string;
  box_office?: string;
  production?: string;
  website?: string;
}

interface MovieNight {
  id: string;
  date: string;
  imdb_id: string | null;
  movies: Record<string, Movie> | null;
  movie_night_group_id: string;
}

export default function ProfileMovieNightDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [movieNight, setMovieNight] = useState<MovieNight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localMovies, setLocalMovies] = useState<Record<string, Movie> | null>(null);

  const movieNightId = params.id as string;
  const handle = params.handle as string;

  useEffect(() => {
    const fetchMovieNight = async () => {
      if (!movieNightId) {
        router.push(`/profile/${handle}`);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/movie-night/get-public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieNightId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch movie night');
        }

        const data = await response.json();
        setMovieNight(data);
        setLocalMovies(data.movies);
      } catch (error) {
        console.error('Error fetching movie night:', error);
        setError('Failed to load movie night');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieNight();
  }, [movieNightId, router, handle]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !movieNight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || 'Movie night not found'}</div>
      </div>
    );
  }

  const date = new Date(movieNight.date);
  const selectedMovie = movieNight.imdb_id ? localMovies?.[movieNight.imdb_id] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/profile/${handle}`)}
                className="text-gray-400 hover:text-gray-500 mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h1>
                <p className="text-sm text-gray-500">
                  {date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Selected Movie */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Movie</h4>
              {selectedMovie ? (
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-24 h-36 relative rounded overflow-hidden">
                      <Image
                        src={selectedMovie.poster_url}
                        alt={selectedMovie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-base font-medium text-gray-900">{selectedMovie.title}</h5>
                      <p className="text-sm text-gray-500">
                        {selectedMovie.year} • {selectedMovie.runtime} min
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">No movie selected yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 