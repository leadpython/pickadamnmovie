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

    // Delete movie night
    const { error: deleteError } = await supabaseAdmin
      .from('movie_night')
      .delete()
      .eq('id', movieNightId)
      .eq('movie_night_group_id', session.movie_night_group_id);

    if (deleteError) {
      console.error('Error deleting movie night:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete movie night' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete movie night error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 