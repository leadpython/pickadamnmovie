import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { date, description, sessionId } = await request.json();

    // Validate required fields
    if (!date || !description || !sessionId) {
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

    // Create movie night
    const { data: movieNight, error: createError } = await supabaseAdmin
      .from('movie_night')
      .insert({
        date,
        description,
        movie_night_group_id: session.movie_night_group_id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating movie night:', createError);
      return NextResponse.json(
        { error: 'Failed to create movie night' },
        { status: 500 }
      );
    }

    return NextResponse.json(movieNight);
  } catch (error) {
    console.error('Create movie night error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 