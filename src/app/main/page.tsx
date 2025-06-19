'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import Image from 'next/image';
import NewMovieNightModal from '@/components/NewMovieNightModal';
import MovieSearchModal from '@/components/MovieSearchModal';
import MovieDetailsModal from '@/components/MovieDetailsModal';

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

interface OMDBMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Ratings?: { Source: string; Value: string }[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
}

export default function MainPage() {
  const router = useRouter();
  const { sessionId, group, isHydrated } = useStore();
  const [isValidating, setIsValidating] = useState(true);
  const [movieNights, setMovieNights] = useState<MovieNight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState({
    roster: false,
    upcoming: false,
    past: false,
  });
  
  // Roster management state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAddingToRoster, setIsAddingToRoster] = useState(false);
  const [rosterMovies, setRosterMovies] = useState<Movie[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [watchedMovieIds, setWatchedMovieIds] = useState<string[]>([]);
  const [rosterCount, setRosterCount] = useState(0);
  
  // Movie details modal state
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const fetchRosterMovies = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setIsLoadingRoster(true);
      const response = await fetch('/api/movie-roster/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roster movies');
      }

      const data = await response.json();
      setRosterMovies(data.movies || []);
    } catch (error) {
      console.error('Error fetching roster movies:', error);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [sessionId]);

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

  const fetchWatchedMovies = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/movie-night/watched-movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watched movies');
      }

      const data = await response.json();
      setWatchedMovieIds(data.watchedMovieIds || []);
    } catch (error) {
      console.error('Error fetching watched movies:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    const validateSession = async () => {
      console.log('Starting session validation:', { sessionId, group, isHydrated });

      // Wait for hydration to complete
      if (!isHydrated) {
        console.log('Waiting for store hydration...');
        return;
      }

      // If no session in store, redirect to login
      if (!sessionId || !group) {
        console.log('No session found in store, redirecting to login');
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Making API request to validate session...');
        // Validate session through API
        const response = await fetch('/api/session/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.valid) {
          console.log('Session is valid, setting isValidating to false');
          setIsValidating(false);
          
          // Fetch movie nights
          const movieNightsResponse = await fetch('/api/movie-night/list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          if (!movieNightsResponse.ok) {
            throw new Error('Failed to fetch movie nights');
          }

          const movieNightsData = await movieNightsResponse.json();
          setMovieNights(movieNightsData);
          
          // Fetch roster movies and watched movies
          await fetchRosterMovies();
          await fetchRosterCount();
          await fetchWatchedMovies();
        } else {
          console.log('Session validation failed:', data.error);
          router.push('/');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [sessionId, group, isHydrated, router, fetchRosterMovies, fetchRosterCount, fetchWatchedMovies]);

  const handleSubmit = async (formData: { date: string; time: string; timezone: string }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Store the date as-is without any conversions
      const dateTimeString = `${formData.date}T${formData.time}`;
      
      const response = await fetch('/api/movie-night/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateTimeString,
          timezone: formData.timezone,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create movie night');
      }

      // Add the new movie night to the list
      setMovieNights(prev => [data, ...prev]);

      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating movie night:', error);
      setError(error instanceof Error ? error.message : 'Failed to create movie night');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchMovie = () => {
    setIsSearchModalOpen(true);
  };

  const handleSelectMovie = (movie: OMDBMovie) => {
    handleAddToRoster(movie);
    setIsSearchModalOpen(false);
  };

  const handleAddToRoster = async (movie: OMDBMovie) => {
    if (!sessionId) {
      alert('You must be logged in to add movies to the roster.');
      return;
    }

    setIsAddingToRoster(true);
    try {
      const response = await fetch('/api/movie-roster/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          movie,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add movie to roster');
      }

      // Refresh roster movies
      await fetchRosterMovies();
    } catch (error) {
      console.error('Error adding movie to roster:', error);
      alert(error instanceof Error ? error.message : 'Failed to add movie to roster');
    } finally {
      setIsAddingToRoster(false);
    }
  };

  const handleRemoveFromRoster = async (imdbId: string) => {
    if (!sessionId || !confirm('Are you sure you want to remove this movie from the roster?')) return;

    try {
      const response = await fetch('/api/movie-roster/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imdb_id: imdbId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove movie from roster');
      }

      // Refresh roster movies
      await fetchRosterMovies();
    } catch (error) {
      console.error('Error removing movie from roster:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove movie from roster');
    }
  };

  const toggleSection = (section: 'roster' | 'upcoming' | 'past') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMovieClick = (imdbId: string) => {
    setSelectedMovieId(imdbId);
  };

  const handleCloseMovieDetails = () => {
    setSelectedMovieId(null);
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
      const formattedDate = formatDate(_year, _month, day);
      const formattedFullDate = formatFullDate(_year, _month, day);
      const formattedFullDateTime = formatFullDateTime(_year, _month, day, hour, minute);
      
      // Convert to user's local timezone
      const userLocalTime = convertToUserLocalTime(dateString, timezone);
      
      return {
        date: formattedDate,
        time: formattedTime + ` ${timezoneAbbr} (${userLocalTime})`,
        fullDate: formattedFullDate,
        fullDateTime: formattedFullDateTime + ` ${timezoneAbbr} (${userLocalTime})`
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
        date: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }) + ' UTC (' + userLocalTime + ')',
        fullDate: date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        fullDateTime: date.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
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

  // Helper function to format date
  const formatDate = (year: number, month: number, day: number): string => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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

  // Helper function to format full date and time
  const formatFullDateTime = (year: number, month: number, day: number, hour: number, minute: number): string => {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = formatTime(hour, minute);
    return `${dateStr} at ${timeStr}`;
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
      
      // Get the user's local timezone offset (in hours)
      const localOffsetHours = new Date().getTimezoneOffset() / -60;
      
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
      
      // Get user's timezone abbreviation
      const userTimezoneAbbr = new Date().toLocaleTimeString('en-US', {
        timeZoneName: 'short'
      }).split(' ').pop() || 'Local';
      
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

  // Show loading state while validating or waiting for hydration
  if (!isHydrated || isValidating || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render anything if no session
  if (!sessionId || !group) {
    return null;
  }

  // Separate past and upcoming movie nights
  const now = new Date();
  const upcomingMovieNights = movieNights.filter(mn => new Date(mn.date) > now);
  const pastMovieNights = movieNights.filter(mn => new Date(mn.date) <= now);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Branding */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image
                  src="/pickadamnmovie.png"
                  alt="PickADamnMovie"
                  width={200}
                  height={0}
                  className="h-12 w-auto"
                  priority
                />
              </div>
              <div className="hidden md:block ml-6">
                <div className="flex items-baseline space-x-4">
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-900 font-medium">{group.name}</span>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  useStore.getState().clearSession();
                  router.push('/');
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Movie Roster */}
          <div className="mb-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <button
                  onClick={() => toggleSection('roster')}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${collapsedSections.roster ? 'rotate-90' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Movie Roster</span>
                  <span className="text-sm font-normal text-gray-500">({rosterCount})</span>
                </button>
                <p className="mt-1 text-sm text-gray-500">
                  Movies available for selection in movie nights
                </p>
              </div>
            </div>
            {!collapsedSections.roster && (
              <>
                {isLoadingRoster ? (
                  <div className="mt-4 text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading roster...</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {rosterMovies.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                        {/* Add Movie Card */}
                        <button
                          onClick={handleSearchMovie}
                          disabled={isAddingToRoster}
                          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="aspect-[2/3] relative rounded-t-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center">
                            {isAddingToRoster ? (
                              <>
                                <svg className="animate-spin h-6 w-6 text-gray-400 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xs text-gray-500">Adding...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6 text-gray-400 mb-1 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Add</span>
                              </>
                            )}
                          </div>
                        </button>
                        {rosterMovies.map((movie) => (
                          <div
                            key={movie.imdb_id}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative cursor-pointer"
                            onClick={() => handleMovieClick(movie.imdb_id)}
                          >
                            <div className="aspect-[2/3] relative rounded-t-lg overflow-hidden">
                              <Image
                                src={movie.poster_url === 'N/A' ? '/movie-placeholder.svg' : movie.poster_url}
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                              
                              {/* Watched Indicator */}
                              {watchedMovieIds.includes(movie.imdb_id) && (
                                <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <h5 className="text-xs font-medium text-gray-900 truncate">
                                {movie.title}
                              </h5>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {movie.year} • {movie.runtime} min
                                {watchedMovieIds.includes(movie.imdb_id) && (
                                  <span className="text-green-600 font-medium"> • Watched</span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromRoster(movie.imdb_id);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              title="Remove from roster"
                            >
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                        {/* Add Movie Card (when no movies) */}
                        <button
                          onClick={handleSearchMovie}
                          disabled={isAddingToRoster}
                          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="aspect-[2/3] relative rounded-t-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center">
                            {isAddingToRoster ? (
                              <>
                                <svg className="animate-spin h-6 w-6 text-gray-400 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xs text-gray-500">Adding...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6 text-gray-400 mb-1 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Add</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Upcoming Movie Nights */}
          <div className="mb-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <button
                  onClick={() => toggleSection('upcoming')}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${collapsedSections.upcoming ? 'rotate-90' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Upcoming Movie Nights</span>
                  <span className="text-sm font-normal text-gray-500">({upcomingMovieNights.length})</span>
                </button>
              </div>
            </div>
            {!collapsedSections.upcoming && (
              <div className="mt-4 space-y-2">
                {/* New Movie Night Card */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isSubmitting}
                  className="w-full bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 text-left border-2 border-dashed border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-3">
                    <div className="flex items-center space-x-3">
                      {/* New Movie Night Icon */}
                      <div className="flex-shrink-0 w-16 h-24 relative rounded overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-6 w-6 text-gray-400 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-[10px] text-gray-500 text-center">Creating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-[10px] text-gray-500 text-center">New</span>
                          </>
                        )}
                      </div>

                      {/* New Movie Night Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {isSubmitting ? 'Creating...' : 'New Movie Night'}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {isSubmitting ? 'Please wait...' : 'Schedule a new movie night'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {isSubmitting ? 'Setting up your movie night...' : 'Click to create a new movie night'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Choose date and time
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {upcomingMovieNights.map((movieNight) => {
                  const formattedDate = formatDateWithTimezone(movieNight.date, movieNight.timezone || 'UTC');
                  const selectedMovie = movieNight.imdb_id && movieNight.movies ? movieNight.movies[movieNight.imdb_id] : null;

                  return (
                    <div
                      key={movieNight.id}
                      onClick={() => router.push(`/main/${movieNight.id}`)}
                      className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="p-3">
                        <div className="flex items-center space-x-3">
                          {/* Movie Poster */}
                          <div className="flex-shrink-0 w-16 h-24 relative rounded overflow-hidden border border-gray-200">
                            {selectedMovie ? (
                              <Image
                                src={selectedMovie.poster_url}
                                alt={selectedMovie.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-gray-100">
                                <div className="w-6 h-6 mb-1">
                                  <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-gray-500 text-center">
                                  No Movie
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Movie Night Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                  {formattedDate.date}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {formattedDate.time}
                                </p>
                              </div>
                            </div>

                            <div className="mt-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {selectedMovie ? selectedMovie.title : 'No movie selected yet'}
                              </h4>
                              {selectedMovie && (
                                <p className="text-xs text-gray-500">
                                  {selectedMovie.year} • {selectedMovie.runtime} min
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {upcomingMovieNights.length === 0 && (
                  <div className="text-center py-8">
                    <h3 className="text-sm font-medium text-gray-900">No upcoming movie nights</h3>
                    <p className="mt-1 text-xs text-gray-500">Get started by creating your first movie night!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Past Movie Nights */}
          {pastMovieNights.length > 0 && (
            <div className="mt-6">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <button
                    onClick={() => toggleSection('past')}
                    className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${collapsedSections.past ? 'rotate-90' : 'rotate-0'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Past Movie Nights</span>
                    <span className="text-sm font-normal text-gray-500">({pastMovieNights.length})</span>
                  </button>
                </div>
              </div>
              {!collapsedSections.past && (
                <div className="mt-3 space-y-1">
                  {pastMovieNights.map((movieNight) => {
                    const formattedDate = formatDateWithTimezone(movieNight.date, movieNight.timezone || 'UTC');
                    const selectedMovie = movieNight.imdb_id && movieNight.movies ? movieNight.movies[movieNight.imdb_id] : null;

                    return (
                      <div
                        key={movieNight.id}
                        onClick={() => router.push(`/main/${movieNight.id}`)}
                        className="bg-white/50 shadow-sm rounded overflow-hidden hover:bg-white/80 transition-colors duration-200 cursor-pointer"
                      >
                        <div className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            {/* Tiny Movie Poster */}
                            <div className="flex-shrink-0 w-8 h-12 relative rounded overflow-hidden border border-gray-200">
                              {selectedMovie ? (
                                <Image
                                  src={selectedMovie.poster_url}
                                  alt={selectedMovie.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Movie Night Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-600">
                                    {formattedDate.date}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formattedDate.time}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600 truncate ml-2">
                                  {selectedMovie ? selectedMovie.title : 'No movie selected'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Movie Night Modal */}
      <NewMovieNightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />

      {/* Search Modal */}
      {isSearchModalOpen && (
        <MovieSearchModal
          onClose={() => setIsSearchModalOpen(false)}
          onSelectMovie={handleSelectMovie}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovieId && (
        <MovieDetailsModal
          imdbId={selectedMovieId}
          onClose={handleCloseMovieDetails}
        />
      )}
    </div>
  );
} 