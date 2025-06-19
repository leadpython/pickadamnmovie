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

    // Get movie night to verify it exists
    const { data: movieNight, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select('id, imdb_id')
      .eq('id', movieNightId)
      .eq('movie_night_group_id', session.movie_night_group_id)
      .single();

    if (fetchError || !movieNight) {
      return NextResponse.json(
        { error: 'Movie night not found' },
        { status: 404 }
      );
    }

    // Check if there's a movie to clear
    if (!movieNight.imdb_id) {
      return NextResponse.json(
        { error: 'No movie selected to clear' },
        { status: 400 }
      );
    }

    // Clear the selected movie
    const { error: updateError } = await supabaseAdmin
      .from('movie_night')
      .update({ imdb_id: null })
      .eq('id', movieNightId)
      .eq('movie_night_group_id', session.movie_night_group_id);

    if (updateError) {
      console.error('Error clearing movie from movie night:', updateError);
      return NextResponse.json(
        { error: 'Failed to clear movie' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Movie cleared successfully'
    });
  } catch (error) {
    console.error('Clear movie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 