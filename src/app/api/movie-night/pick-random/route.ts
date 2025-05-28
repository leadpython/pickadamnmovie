import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { movieNightId, sessionId } = await request.json();

    // Validate required fields
    if (!movieNightId || !sessionId) {
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

    // Get movie night with movies
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

    if (!movieNight.movies || Object.keys(movieNight.movies).length === 0) {
      return NextResponse.json(
        { error: 'No movies to pick from' },
        { status: 400 }
      );
    }

    // Pick a random movie
    const movieIds = Object.keys(movieNight.movies);
    const randomIndex = Math.floor(Math.random() * movieIds.length);
    const selectedMovieId = movieIds[randomIndex];
    const selectedMovie = movieNight.movies[selectedMovieId];

    // Update movie night with selected movie
    const { error: updateError } = await supabaseAdmin
      .from('movie_night')
      .update({ imdb_id: selectedMovieId })
      .eq('id', movieNightId)
      .eq('movie_night_group_id', session.movie_night_group_id);

    if (updateError) {
      console.error('Error updating movie night:', updateError);
      return NextResponse.json(
        { error: 'Failed to update movie night' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      selectedMovie,
      imdb_id: selectedMovieId
    });
  } catch (error) {
    console.error('Pick random movie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 