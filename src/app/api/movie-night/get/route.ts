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

    // Check if it's a guest session
    const { data: guestSession } = await supabaseAdmin
      .from('sessions_guest')
      .select('id')
      .eq('id', sessionId)
      .single();

    let movieNight;

    if (!guestSession) {
      // Validate regular session
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

      // Fetch movie night data for the specific group
      const { data, error } = await supabaseAdmin
        .from('movie_night')
        .select('*')
        .eq('id', movieNightId)
        .eq('movie_night_group_id', session.movie_night_group_id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Movie night not found' },
          { status: 404 }
        );
      }

      movieNight = data;
    } else {
      // Handle guest session - fetch movie night without group restriction
      const { data, error } = await supabaseAdmin
        .from('movie_night')
        .select('*')
        .eq('id', movieNightId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Movie night not found' },
          { status: 404 }
        );
      }

      movieNight = data;
    }

    // If there's a selected movie (imdb_id), fetch its details from the roster
    let movies = null;
    if (movieNight.imdb_id) {
      const { data: rosterMovie, error: rosterError } = await supabaseAdmin
        .from('movie_roster')
        .select('imdb_id, meta_data')
        .eq('imdb_id', movieNight.imdb_id)
        .single();

      if (!rosterError && rosterMovie) {
        // Transform the movie data to match the expected format
        const movieData = {
          imdb_id: rosterMovie.imdb_id,
          title: rosterMovie.meta_data.title || 'Unknown Title',
          year: rosterMovie.meta_data.year || 0,
          runtime: rosterMovie.meta_data.runtime || 0,
          poster_url: rosterMovie.meta_data.poster_url || '/movie-placeholder.svg',
          rated: rosterMovie.meta_data.rated,
          released: rosterMovie.meta_data.released,
          genre: rosterMovie.meta_data.genre,
          director: rosterMovie.meta_data.director,
          writer: rosterMovie.meta_data.writer,
          actors: rosterMovie.meta_data.actors,
          plot: rosterMovie.meta_data.plot,
          language: rosterMovie.meta_data.language,
          country: rosterMovie.meta_data.country,
          awards: rosterMovie.meta_data.awards,
          ratings: rosterMovie.meta_data.ratings,
          metascore: rosterMovie.meta_data.metascore,
          imdb_rating: rosterMovie.meta_data.imdb_rating,
          imdb_votes: rosterMovie.meta_data.imdb_votes,
          type: rosterMovie.meta_data.type,
          dvd: rosterMovie.meta_data.dvd,
          box_office: rosterMovie.meta_data.box_office,
          production: rosterMovie.meta_data.production,
          website: rosterMovie.meta_data.website,
        };

        movies = {
          [rosterMovie.imdb_id]: movieData
        };
      }
    }

    return NextResponse.json({
      ...movieNight,
      movies
    });
  } catch (error) {
    console.error('Error fetching movie night:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 