export interface Movie {
  id: string;
  title: string;
  nominatedBy: string;
}

export interface MovieNight {
  id: string;
  date: string;
  status: 'upcoming' | 'completed';
  movie?: string;
  description?: string;
  nominatedMovies?: Movie[];
}

export interface MovieNightGroup {
  id: string;
  handle: string;
  name: string;
  description: string;
  betakey: string;
  upcomingMovieNights: MovieNight[];
} 