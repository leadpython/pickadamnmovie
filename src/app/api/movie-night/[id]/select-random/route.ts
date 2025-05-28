import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

interface Movie {
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const params_ = await params;
  const { id } = params_;

  try {
    // First, get the current movie night data
    const { data: movieNight, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select('movies')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching movie night:', fetchError);
      return NextResponse.json(
        { message: 'Movie night not found' },
        { status: 404 }
      );
    }

    // Get the nominated movies
    const movies = movieNight.movies || {};
    const movieList = Object.values(movies) as Movie[];

    if (movieList.length === 0) {
      return NextResponse.json(
        { message: 'No movies nominated yet' },
        { status: 400 }
      );
    }

    // Select a random movie
    const randomIndex = Math.floor(Math.random() * movieList.length);
    const selectedMovie = movieList[randomIndex];

    // Update the movie night with the selected movie
    const { error: updateError } = await supabaseAdmin
      .from('movie_night')
      .update({ 
        imdb_id: selectedMovie.imdbID
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating movie night:', updateError);
      return NextResponse.json(
        { message: 'Failed to select random movie' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Movie selected successfully',
      selectedMovie
    });
  } catch (error) {
    console.error('Error selecting random movie:', error);
    return NextResponse.json(
      { message: 'Failed to select random movie' },
      { status: 500 }
    );
  }
} 