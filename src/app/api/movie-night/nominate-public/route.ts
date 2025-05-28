import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { movieNightId, movie, secret } = await request.json();

    // Validate required fields
    if (!movieNightId || !movie || !secret) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get movie night data and validate secret
    const { data: movieNight, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select('id, movies, secret')
      .eq('id', movieNightId)
      .single();

    if (fetchError || !movieNight) {
      return NextResponse.json(
        { error: 'Movie night not found' },
        { status: 404 }
      );
    }

    // Validate secret
    if (movieNight.secret !== secret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 403 }
      );
    }

    // Prepare the movie object with all available data
    const movieToAdd = {
      imdb_id: movie.imdbID,
      title: movie.Title,
      year: parseInt(movie.Year),
      runtime: parseInt(movie.Runtime),
      poster_url: movie.Poster,
      rated: movie.Rated,
      released: movie.Released,
      genre: movie.Genre,
      director: movie.Director,
      writer: movie.Writer,
      actors: movie.Actors,
      plot: movie.Plot,
      language: movie.Language,
      country: movie.Country,
      awards: movie.Awards,
      ratings: movie.Ratings,
      metascore: movie.Metascore,
      imdb_rating: movie.imdbRating,
      imdb_votes: movie.imdbVotes,
      type: movie.Type,
      dvd: movie.DVD,
      box_office: movie.BoxOffice,
      production: movie.Production,
      website: movie.Website,
    };

    // Update movies object
    const updatedMovies = {
      ...movieNight.movies,
      [movie.imdbID]: movieToAdd,
    };

    // Update movie night with new movie
    const { error: updateError } = await supabaseAdmin
      .from('movie_night')
      .update({ movies: updatedMovies })
      .eq('id', movieNightId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update movie night' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      movie: movieToAdd,
      movies: updatedMovies,
    });
  } catch (error) {
    console.error('Public movie nomination error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 