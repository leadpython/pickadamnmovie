'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MovieSearchModal from '@/components/MovieSearchModal';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import SecretWordModal from '@/components/SecretWordModal';

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

interface MovieNight {
  id: string;
  date: string;
  imdb_id: string | null;
  movies: Record<string, Movie> | null;
  movie_night_group_id: string;
}

interface MovieNightGroup {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  created_at: string;
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const router = useRouter();
  const [group, setGroup] = useState<MovieNightGroup | null>(null);
  const [movieNights, setMovieNights] = useState<MovieNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState<string>('');
  
  // Roster state
  const [rosterMovies, setRosterMovies] = useState<Movie[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [watchedMovieIds, setWatchedMovieIds] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState({
    roster: false,
    upcoming: false,
    past: false,
  });
  
  // Add movie state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAddingToRoster, setIsAddingToRoster] = useState(false);
  
  // Movie details modal state
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isMovieDetailsFromSearch, setIsMovieDetailsFromSearch] = useState(false);
  
  // Secret word modal state
  const [isSecretWordModalOpen, setIsSecretWordModalOpen] = useState(false);
  const [isValidatingSecret, setIsValidatingSecret] = useState(false);
  const [secretWordError, setSecretWordError] = useState<string | null>(null);
  const [isSecretWordValid, setIsSecretWordValid] = useState(false);
  const [validatedSecretWord, setValidatedSecretWord] = useState<string | null>(null);

  const fetchWatchedMovies = useCallback(async () => {
    try {
      const response = await fetch('/api/movie-night/watched-movies-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watched movies');
      }

      const data = await response.json();
      setWatchedMovieIds(data.watchedMovieIds || []);
    } catch (error) {
      console.error('Error fetching watched movies:', error);
    }
  }, [handle]);

  const fetchRosterMovies = useCallback(async () => {
    try {
      setIsLoadingRoster(true);
      const response = await fetch('/api/movie-roster/list-public');
      
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract handle from params
        const { handle: resolvedHandle } = await params;
        setHandle(resolvedHandle);

        // Fetch group data
        const groupResponse = await fetch(`/api/movie-night-group/${resolvedHandle}`);

        if (!groupResponse.ok) {
          throw new Error('Group not found');
        }

        const groupData = await groupResponse.json();
        setGroup(groupData.group);
        setMovieNights(groupData.movieNights || []);

        // Fetch roster movies
        await fetchRosterMovies();

        // Fetch watched movies
        await fetchWatchedMovies();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, fetchWatchedMovies, fetchRosterMovies, handle]);

  const handleMovieNightClick = (movieNightId: string) => {
    router.push(`/profile/${handle}/movie-night/${movieNightId}`);
  };

  const toggleSection = (section: 'roster' | 'upcoming' | 'past') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSearchMovie = () => {
    // Check if secret word is already validated
    if (isSecretWordValid) {
      setIsSearchModalOpen(true);
    } else {
      setIsSecretWordModalOpen(true);
    }
  };

  const handleSecretWordSubmit = async (secretWord: string) => {
    setIsValidatingSecret(true);
    setSecretWordError(null);

    try {
      const response = await fetch('/api/movie-night-group/validate-secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle,
          secretWord,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate secret word');
      }

      // Secret word is valid
      setIsSecretWordValid(true);
      setValidatedSecretWord(secretWord);
      setIsSecretWordModalOpen(false);
      setIsSearchModalOpen(true);
    } catch (error) {
      console.error('Error validating secret word:', error);
      setSecretWordError(error instanceof Error ? error.message : 'Failed to validate secret word');
    } finally {
      setIsValidatingSecret(false);
    }
  };

  const handleCloseSecretWordModal = () => {
    setIsSecretWordModalOpen(false);
    setSecretWordError(null);
  };

  const handleSelectMovie = (movie: OMDBMovie) => {
    // Instead of adding immediately, show the movie details modal
    setSelectedMovieId(movie.imdbID);
    setIsMovieDetailsFromSearch(true);
    setIsSearchModalOpen(false);
  };

  const handleAddToRoster = async (movie: OMDBMovie) => {
    setIsAddingToRoster(true);
    try {
      const response = await fetch('/api/movie-roster/add-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie: {
            Title: movie.Title,
            Year: movie.Year,
            imdbID: movie.imdbID,
            Type: movie.Type,
            Poster: movie.Poster,
            Rated: movie.Rated,
            Released: movie.Released,
            Runtime: movie.Runtime,
            Genre: movie.Genre,
            Director: movie.Director,
            Writer: movie.Writer,
            Actors: movie.Actors,
            Plot: movie.Plot,
            Language: movie.Language,
            Country: movie.Country,
            Awards: movie.Awards,
            Ratings: movie.Ratings,
            Metascore: movie.Metascore,
            imdbRating: movie.imdbRating,
            imdbVotes: movie.imdbVotes,
            DVD: movie.DVD,
            BoxOffice: movie.BoxOffice,
            Production: movie.Production,
            Website: movie.Website,
          },
          handle,
          secretWord: validatedSecretWord,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add movie to roster');
      }

      // Close the modal and refresh roster movies
      setSelectedMovieId(null);
      await fetchRosterMovies();
    } catch (error) {
      console.error('Error adding movie to roster:', error);
      alert(error instanceof Error ? error.message : 'Failed to add movie to roster');
    } finally {
      setIsAddingToRoster(false);
    }
  };

  const handleCloseMovieDetails = () => {
    setSelectedMovieId(null);
    setIsMovieDetailsFromSearch(false);
  };

  const handleMovieClick = (imdbId: string) => {
    setSelectedMovieId(imdbId);
    setIsMovieDetailsFromSearch(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Movie night group not found</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingNights = movieNights.filter(night => new Date(night.date) > new Date());
  const pastNights = movieNights.filter(night => new Date(night.date) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Branding Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/pickadamnmovie.png"
                alt="Pick a Damn Movie"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Group Info */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
            <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
            {group.description && (
              <p className="mt-1 text-sm text-gray-600">{group.description}</p>
            )}
          </div>

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
                  <span className="text-sm font-normal text-gray-500">({rosterMovies.length})</span>
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

          {/* Movie Nights */}
          <div className="space-y-6">
            {/* Upcoming Movie Nights */}
            {upcomingNights.length > 0 && (
              <div>
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
                      <span className="text-sm font-normal text-gray-500">({upcomingNights.length})</span>
                    </button>
                  </div>
                </div>
                {!collapsedSections.upcoming && (
                  <div className="mt-4 space-y-2">
                    {upcomingNights.map((night) => {
                      const date = new Date(night.date);
                      const selectedMovie = night.imdb_id && night.movies ? night.movies[night.imdb_id] : null;

                      return (
                        <button
                          key={night.id}
                          onClick={() => handleMovieNightClick(night.id)}
                          className="w-full bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 text-left"
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
                                      {date.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      {date.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Upcoming
                                  </span>
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
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Past Movie Nights */}
            {pastNights.length > 0 && (
              <div>
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
                      <span className="text-sm font-normal text-gray-500">({pastNights.length})</span>
                    </button>
                  </div>
                </div>
                {!collapsedSections.past && (
                  <div className="mt-3 space-y-1">
                    {pastNights.map((night) => {
                      const date = new Date(night.date);
                      const selectedMovie = night.imdb_id && night.movies ? night.movies[night.imdb_id] : null;

                      return (
                        <button
                          key={night.id}
                          onClick={() => handleMovieNightClick(night.id)}
                          className="w-full bg-white/50 shadow-sm rounded overflow-hidden hover:bg-white/80 transition-colors duration-200 text-left"
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
                                      {date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {date.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600 truncate ml-2">
                                    {selectedMovie ? selectedMovie.title : 'No movie selected'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {movieNights.length === 0 && (
              <div className="text-center py-8">
                <h3 className="text-sm font-medium text-gray-900">No movie nights scheduled yet</h3>
                <p className="mt-1 text-xs text-gray-500">Get started by creating your first movie night!</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
          onAddToRoster={handleAddToRoster}
          isAddingToRoster={isAddingToRoster}
          showAddButton={isSecretWordValid && isMovieDetailsFromSearch}
        />
      )}

      {/* Secret Word Modal */}
      <SecretWordModal
        isOpen={isSecretWordModalOpen}
        onClose={handleCloseSecretWordModal}
        onSubmit={handleSecretWordSubmit}
        isSubmitting={isValidatingSecret}
        error={secretWordError}
      />
    </div>
  );
}
