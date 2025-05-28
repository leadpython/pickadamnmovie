export interface Movie {
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

export interface MovieNight {
  id: string;
  date: string;
  description?: string;
  status: 'upcoming' | 'completed';
  imdb_id?: string;
  movies?: Record<string, Movie>;
}

export interface MovieNightGroup {
  id: string;
  handle: string;
  name: string;
  description: string;
  betakey: string;
  upcomingMovieNights: MovieNight[];
} 