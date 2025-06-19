import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { movie, handle, secretWord } = await request.json();

    // Validate required fields
    if (!movie || !handle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate secret word if provided
    if (secretWord) {
      const { data: group, error: groupError } = await supabaseAdmin
        .from('movie_night_group')
        .select('id, secret_word')
        .eq('handle', handle)
        .single();

      if (groupError || !group) {
        return NextResponse.json(
          { error: 'Movie night group not found' },
          { status: 404 }
        );
      }

      // If group has a secret word, validate it
      if (group.secret_word && group.secret_word !== secretWord) {
        return NextResponse.json(
          { error: 'Invalid secret word' },
          { status: 401 }
        );
      }
    }

    // Check if movie already exists in roster
    const { data: existingMovie } = await supabaseAdmin
      .from('movie_roster')
      .select('id')
      .eq('imdb_id', movie.imdbID)
      .single();

    if (existingMovie) {
      return NextResponse.json(
        { error: 'Movie already exists in roster' },
        { status: 409 }
      );
    }

    // Prepare movie metadata
    const movieMetadata = {
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

    // Add movie to roster
    const { data: newMovie, error: insertError } = await supabaseAdmin
      .from('movie_roster')
      .insert({
        imdb_id: movie.imdbID,
        meta_data: movieMetadata,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding movie to roster:', insertError);
      return NextResponse.json(
        { error: 'Failed to add movie to roster' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Movie added to roster successfully',
      movie: {
        imdb_id: newMovie.imdb_id,
        ...movieMetadata,
      },
    });
  } catch (error) {
    console.error('Error adding movie to roster:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 