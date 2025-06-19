import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(request: Request) {
  try {
    // Get the group ID from the session
    const sessionId = request.headers.get('x-session-id');
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 401 });
    }

    // Get the group ID from the session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('movie_night_group_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch movie nights for the group
    const { data: movieNights, error } = await supabaseAdmin
      .from('movie_night')
      .select('*')
      .eq('movie_night_group_id', session.movie_night_group_id)
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch movie nights' }, { status: 500 });
    }

    return NextResponse.json(movieNights);
  } catch (error) {
    console.error('Error fetching movie nights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

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

    // Fetch movie nights for the group
    const { data: movieNights, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select(`
        id,
        date,
        imdb_id,
        movie_night_group_id,
        timezone
      `)
      .eq('movie_night_group_id', session.movie_night_group_id)
      .order('date', { ascending: false });

    if (fetchError) {
      console.error('Error fetching movie nights:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch movie nights' },
        { status: 500 }
      );
    }

    // For each movie night that has an imdb_id, fetch the movie details from the roster
    const movieNightsWithMovies = await Promise.all(
      movieNights.map(async (movieNight) => {
        if (!movieNight.imdb_id) {
          return {
            ...movieNight,
            movies: null
          };
        }

        // Fetch movie details from roster
        const { data: rosterMovie, error: rosterError } = await supabaseAdmin
          .from('movie_roster')
          .select('imdb_id, meta_data')
          .eq('imdb_id', movieNight.imdb_id)
          .single();

        if (rosterError || !rosterMovie) {
          return {
            ...movieNight,
            movies: null
          };
        }

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

        return {
          ...movieNight,
          movies: {
            [rosterMovie.imdb_id]: movieData
          }
        };
      })
    );

    return NextResponse.json(movieNightsWithMovies);
  } catch (error) {
    console.error('Fetch movie nights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 