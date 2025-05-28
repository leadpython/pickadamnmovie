import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { movieNightId, sessionId, movie } = await request.json();

    // Validate required fields
    if (!movieNightId || !sessionId || !movie) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('movie_night_group_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get current movie night data
    const { data: movieNight, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select('movies')
      .eq('id', movieNightId)
      .eq('movie_night_group_id', session.movie_night_group_id)
      .single();

    if (fetchError || !movieNight) {
      return NextResponse.json(
        { error: 'Movie night not found' },
        { status: 404 }
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
    const currentMovies = movieNight.movies || {};
    const updatedMovies = {
      ...currentMovies,
      [movie.imdbID]: movieToAdd
    };

    // Update movie night with new movie
    const { error: updateError } = await supabaseAdmin
      .from('movie_night')
      .update({ movies: updatedMovies })
      .eq('id', movieNightId)
      .eq('movie_night_group_id', session.movie_night_group_id);

    if (updateError) {
      console.error('Error updating movie night:', updateError);
      return NextResponse.json(
        { error: 'Failed to nominate movie' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      movie: movieToAdd,
      movies: updatedMovies 
    });
  } catch (error) {
    console.error('Nominate movie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 