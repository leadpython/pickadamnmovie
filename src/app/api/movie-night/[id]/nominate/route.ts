import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const params_ = await params;
  const { id } = params_;
  const { movie } = await request.json();

  if (!id || !movie) {
    return NextResponse.json(
      { message: 'Movie night ID and movie data are required' },
      { status: 400 }
    );
  }

  try {
    // First, get the current movies data
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

    // Parse the current movies JSON or initialize as empty object
    const currentMovies = movieNight.movies || {};
    
    // Add the new movie to the movies object
    const updatedMovies = {
      ...currentMovies,
      [movie.imdbID]: movie
    };

    // Update the movie night with the new movies data
    const { error: updateError } = await supabaseAdmin
      .from('movie_night')
      .update({ movies: updatedMovies })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating movie night:', updateError);
      return NextResponse.json(
        { message: 'Failed to nominate movie' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Movie nominated successfully',
      movies: updatedMovies
    });
  } catch (error) {
    console.error('Error nominating movie:', error);
    return NextResponse.json(
      { message: 'Failed to nominate movie' },
      { status: 500 }
    );
  }
} 