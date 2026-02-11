'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/store/store';

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
  timezone: string;
}

export default function MovieNightDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { sessionId } = useStore();
  const [movieNight, setMovieNight] = useState<MovieNight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [localMovies, setLocalMovies] = useState<Record<string, Movie> | null>(null);
  const [rosterCount, setRosterCount] = useState(0);
  const [timezoneOffset, setTimezoneOffset] = useState<number | null>(null);
  const [userTimezoneAbbr, setUserTimezoneAbbr] = useState<string>('Local');

  const movieNightId = params.id as string;
  
  // Set timezone info only on client side to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimezoneOffset(new Date().getTimezoneOffset() / -60);
      const abbr = new Date().toLocaleTimeString('en-US', {
        timeZoneName: 'short'
      }).split(' ').pop() || 'Local';
      setUserTimezoneAbbr(abbr);
    }
  }, []);

  const fetchRosterCount = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/movie-roster/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roster');
      }

      const data = await response.json();
      setRosterCount(data.movies?.length || 0);
    } catch (error) {
      console.error('Error fetching roster count:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    const fetchMovieNight = async () => {
      if (!sessionId || !movieNightId) {
        router.push('/main');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/movie-night/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieNightId,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch movie night');
        }

        const data = await response.json();
        setMovieNight(data);
        setLocalMovies(data.movies);
        
        // Fetch roster count
        await fetchRosterCount();
      } catch (error) {
        console.error('Error fetching movie night:', error);
        setError('Failed to load movie night');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieNight();
  }, [movieNightId, sessionId, router, fetchRosterCount]);

  const handleCancelMovieNight = async () => {
    if (!movieNight || !confirm('Are you sure you want to cancel this movie night?')) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/movie-night/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel movie night');
      }

      router.push('/main');
    } catch (error) {
      console.error('Error canceling movie night:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickRandomMovie = async () => {
    if (rosterCount === 0 || !movieNight) return;
    
    setIsPickingRandom(true);
    try {
      const response = await fetch('/api/movie-night/pick-random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to pick random movie');
      }

      const { selectedMovie, imdb_id } = await response.json();
      
      // Update local movies with the selected movie
      setLocalMovies(prev => {
        if (!prev) return { [imdb_id]: selectedMovie };
        return {
          ...prev,
          [imdb_id]: selectedMovie
        };
      });
      
      setMovieNight(prev => prev ? { ...prev, imdb_id } : null);
    } catch (error) {
      console.error('Error picking random movie:', error);
    } finally {
      setIsPickingRandom(false);
    }
  };

  const handleClearMovie = async () => {
    if (!movieNight || !movieNight.imdb_id) return;
    
    setIsClearing(true);
    try {
      const response = await fetch('/api/movie-night/clear-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieNightId: movieNight.id,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear movie');
      }

      // Update local state to remove the selected movie
      setMovieNight(prev => prev ? { ...prev, imdb_id: null } : null);
    } catch (error) {
      console.error('Error clearing movie:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Utility function to format date with timezone
  const formatDateWithTimezone = (dateString: string, timezone: string) => {
    try {
      // Parse the date string manually to avoid timezone interpretation
      const [datePart, timePart] = dateString.split('T');
      const [_year, _month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Get timezone abbreviation
      const timezoneAbbr = getTimezoneAbbreviation(timezone);
      
      // Format the time manually to avoid timezone conversion
      const formattedTime = formatTime(hour, minute);
      const formattedFullDate = formatFullDate(_year, _month, day);
      
      // Convert to user's local timezone
      const userLocalTime = convertToUserLocalTime(dateString, timezone);
      
      return {
        fullDate: formattedFullDate,
        time: formattedTime + ` ${timezoneAbbr} (${userLocalTime})`
      };
    } catch (error) {
      // Fallback to UTC if timezone is invalid
      console.error('Error formatting date with timezone:', error);
      const date = new Date(dateString);
      const userLocalTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      return {
        fullDate: date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }) + ' UTC (' + userLocalTime + ')'
      };
    }
  };

  // Helper function to format time without timezone conversion
  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Helper function to format full date
  const formatFullDate = (year: number, month: number, day: number): string => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to get timezone abbreviation
  const getTimezoneAbbreviation = (timezone: string): string => {
    const abbreviations: Record<string, string> = {
      'America/New_York': 'ET',
      'America/Chicago': 'CT',
      'America/Denver': 'MT',
      'America/Los_Angeles': 'PT',
      'America/Anchorage': 'AKT',
      'Pacific/Honolulu': 'HT',
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
      'Asia/Tokyo': 'JST',
      'Australia/Sydney': 'AET',
      'UTC': 'UTC',
    };
    return abbreviations[timezone] || timezone;
  };

  // Helper function to convert time to user's local timezone
  const convertToUserLocalTime = (dateString: string, originalTimezone: string): string => {
    try {
      // Parse the date string manually to avoid timezone interpretation
      const [, timePart] = dateString.split('T');
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Get the timezone offset for the original timezone (in hours)
      const originalOffsetHours = getTimezoneOffsetHours(originalTimezone);
      
      // Get the user's local timezone offset (in hours) - use state to avoid hydration mismatch
      const localOffsetHours = timezoneOffset ?? 0;
      
      // Calculate the time difference (how many hours to add to original time)
      const timeDifference = localOffsetHours - originalOffsetHours;
      
      // Calculate the new hour
      let newHour = hour + timeDifference;
      
      // Handle day rollover
      if (newHour >= 24) {
        newHour -= 24;
      } else if (newHour < 0) {
        newHour += 24;
      }
      
      // Format the time
      const period = newHour >= 12 ? 'PM' : 'AM';
      const displayHour = newHour === 0 ? 12 : newHour > 12 ? newHour - 12 : newHour;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${period} ${userTimezoneAbbr}`;
    } catch (error) {
      console.error('Error converting timezone:', error);
      return 'Invalid time';
    }
  };

  // Helper function to get timezone offset in hours
  const getTimezoneOffsetHours = (timezone: string): number => {
    const offsets: Record<string, number> = {
      'America/New_York': -4, // EDT: -4 hours from UTC
      'America/Chicago': -5,  // CDT: -5 hours from UTC
      'America/Denver': -6,   // MDT: -6 hours from UTC
      'America/Los_Angeles': -7, // PDT: -7 hours from UTC
      'America/Anchorage': -8, // AKDT: -8 hours from UTC
      'Pacific/Honolulu': -10, // HST: -10 hours from UTC
      'Europe/London': 1,     // BST: +1 hour from UTC
      'Europe/Paris': 2,      // CEST: +2 hours from UTC
      'Asia/Tokyo': 9,        // JST: +9 hours from UTC
      'Australia/Sydney': 11, // AEDT: +11 hours from UTC
      'UTC': 0,
    };
    return offsets[timezone] || 0;
  };

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

  const selectedMovie = movieNight.imdb_id ? localMovies?.[movieNight.imdb_id] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/main')}
                className="text-gray-400 hover:text-gray-500 mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  {formatDateWithTimezone(movieNight.date, movieNight.timezone || 'UTC').fullDate}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDateWithTimezone(movieNight.date, movieNight.timezone || 'UTC').time}
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
              
              {/* Pick Random Movie Button */}
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={handlePickRandomMovie}
                  disabled={isPickingRandom || isClearing || rosterCount === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPickingRandom ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Picking...
                    </>
                  ) : (
                    'Pick Random Movie From Roster'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearMovie}
                  disabled={!selectedMovie || isPickingRandom || isClearing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Clearing...
                    </>
                  ) : (
                    'Clear'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button
            type="button"
            onClick={handleCancelMovieNight}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Canceling...' : 'Cancel Movie Night'}
          </button>
        </div>
      </div>
    </div>
  );
} 