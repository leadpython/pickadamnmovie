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

    // Check if it's a guest session
    const { data: guestSession } = await supabaseAdmin
      .from('sessions_guest')
      .select('id')
      .eq('id', sessionId)
      .single();

    let movieNight;

    if (!guestSession) {
      // Validate regular session
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

      // Fetch movie night data for the specific group
      const { data, error } = await supabaseAdmin
        .from('movie_night')
        .select('*')
        .eq('id', movieNightId)
        .eq('movie_night_group_id', session.movie_night_group_id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Movie night not found' },
          { status: 404 }
        );
      }

      movieNight = data;
    } else {
      // Handle guest session - fetch movie night without group restriction
      const { data, error } = await supabaseAdmin
        .from('movie_night')
        .select('*')
        .eq('id', movieNightId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Movie night not found' },
          { status: 404 }
        );
      }

      movieNight = data;
    }

    return NextResponse.json(movieNight);
  } catch (error) {
    console.error('Error fetching movie night:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 