import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function DELETE(request: Request) {
  try {
    const { imdb_id } = await request.json();

    // Validate required fields
    if (!imdb_id) {
      return NextResponse.json(
        { error: 'Missing required fields: imdb_id' },
        { status: 400 }
      );
    }

    // Check if movie exists in roster
    const { data: _existingMovie, error: checkError } = await supabaseAdmin
      .from('movie_roster')
      .select('id')
      .eq('imdb_id', imdb_id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Movie not found in roster' },
          { status: 404 }
        );
      }
      console.error('Error checking existing movie:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing movie' },
        { status: 500 }
      );
    }

    // Remove movie from roster
    const { error: deleteError } = await supabaseAdmin
      .from('movie_roster')
      .delete()
      .eq('imdb_id', imdb_id);

    if (deleteError) {
      console.error('Error removing movie from roster:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove movie from roster' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Movie removed from roster successfully' });
  } catch (error) {
    console.error('Remove movie from roster error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 