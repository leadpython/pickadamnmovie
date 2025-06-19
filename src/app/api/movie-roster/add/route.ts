import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { imdb_id, meta_data } = await request.json();

    // Validate required fields
    if (!imdb_id) {
      return NextResponse.json(
        { error: 'Missing required fields: imdb_id' },
        { status: 400 }
      );
    }

    // Check if movie already exists in roster
    const { data: existingMovie, error: checkError } = await supabaseAdmin
      .from('movie_roster')
      .select('id')
      .eq('imdb_id', imdb_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if movie doesn't exist
      console.error('Error checking existing movie:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing movie' },
        { status: 500 }
      );
    }

    if (existingMovie) {
      return NextResponse.json(
        { error: 'Movie already exists in roster' },
        { status: 409 }
      );
    }

    // Add movie to roster
    const { data: movieRoster, error: createError } = await supabaseAdmin
      .from('movie_roster')
      .insert({
        imdb_id,
        meta_data: meta_data || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error adding movie to roster:', createError);
      return NextResponse.json(
        { error: 'Failed to add movie to roster' },
        { status: 500 }
      );
    }

    return NextResponse.json(movieRoster);
  } catch (error) {
    console.error('Add movie to roster error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 