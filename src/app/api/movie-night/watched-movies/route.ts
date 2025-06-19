import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    // Validate required fields
    if (!sessionId) {
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

    // Get all past movie nights with selected movies for this group
    const { data: pastMovieNights, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select('imdb_id')
      .eq('movie_night_group_id', session.movie_night_group_id)
      .not('imdb_id', 'is', null)
      .lt('date', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching watched movies:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch watched movies' },
        { status: 500 }
      );
    }

    // Extract unique imdb_ids from past movie nights
    const watchedMovieIds = [...new Set(pastMovieNights.map(mn => mn.imdb_id))];

    return NextResponse.json({
      watchedMovieIds,
      count: watchedMovieIds.length
    });
  } catch (error) {
    console.error('Watched movies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 