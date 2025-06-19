import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET() {
  try {
    // Fetch all roster movies (global roster) - public access
    const { data: rosterMovies, error } = await supabaseAdmin
      .from('movie_roster')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roster movies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roster movies' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const movies = rosterMovies.map(item => {
      const metaData = item.meta_data || {};
      return {
        imdb_id: item.imdb_id,
        title: metaData.title || 'Unknown Title',
        year: metaData.year || 0,
        runtime: metaData.runtime || 0,
        poster_url: metaData.poster_url || '/movie-placeholder.svg',
        rated: metaData.rated,
        released: metaData.released,
        genre: metaData.genre,
        director: metaData.director,
        writer: metaData.writer,
        actors: metaData.actors,
        plot: metaData.plot,
        language: metaData.language,
        country: metaData.country,
        awards: metaData.awards,
        ratings: metaData.ratings,
        metascore: metaData.metascore,
        imdb_rating: metaData.imdb_rating,
        imdb_votes: metaData.imdb_votes,
        type: metaData.type,
        dvd: metaData.dvd,
        box_office: metaData.box_office,
        production: metaData.production,
        website: metaData.website,
      };
    });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error listing roster movies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 