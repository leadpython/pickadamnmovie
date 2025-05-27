import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { date, description, movieNightGroupId } = await request.json();

    if (!date || !description || !movieNightGroupId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the movie night
    const { data: newMovieNight, error: createError } = await supabaseAdmin
      .from('movie_night')
      .insert([
        {
          date,
          description,
          movie_night_group_id: movieNightGroupId
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating movie night:', createError);
      return NextResponse.json(
        { error: 'Error creating movie night' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      movieNight: {
        ...newMovieNight,
        nominatedMovies: []
      }
    });
  } catch (error) {
    console.error('Error in create-movie-night route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 