import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ handle: string }> }
) {
  const { handle } = await context.params;
  console.log('handle:', handle);
  
  try {
    // Fetch the movie night group by handle
    const { data: group, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .select('*')
      .eq('handle', handle)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Fetch movie nights for the group
    const { data: movieNights, error: movieNightsError } = await supabaseAdmin
      .from('movie_night')
      .select(`
        id,
        date,
        imdb_id,
        movie_night_group_id
      `)
      .eq('movie_night_group_id', group.id)
      .order('date', { ascending: false });

    if (movieNightsError) {
      return NextResponse.json({ error: 'Failed to fetch movie nights' }, { status: 500 });
    }

    // For each movie night, fetch the movie details if imdb_id exists
    const movieNightsWithMovies = await Promise.all(
      (movieNights || []).map(async (movieNight) => {
        if (!movieNight.imdb_id) {
          return { ...movieNight, movies: null };
        }

        // Fetch movie details from roster
        const { data: rosterMovie, error: rosterError } = await supabaseAdmin
          .from('movie_roster')
          .select('imdb_id, meta_data')
          .eq('imdb_id', movieNight.imdb_id)
          .single();

        if (rosterError || !rosterMovie) {
          return { ...movieNight, movies: null };
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

    return NextResponse.json({
      group,
      movieNights: movieNightsWithMovies
    });
  } catch (error) {
    console.error('Error fetching movie night group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 