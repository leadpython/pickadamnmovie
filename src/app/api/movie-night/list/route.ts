import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(request: Request) {
  try {
    // Get the group ID from the session
    const sessionId = request.headers.get('x-session-id');
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 401 });
    }

    // Get the group ID from the session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('movie_night_group_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch movie nights for the group
    const { data: movieNights, error } = await supabaseAdmin
      .from('movie_night')
      .select('*')
      .eq('movie_night_group_id', session.movie_night_group_id)
      .order('date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch movie nights' }, { status: 500 });
    }

    return NextResponse.json(movieNights);
  } catch (error) {
    console.error('Error fetching movie nights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

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

    // Fetch movie nights for the group
    const { data: movieNights, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select(`
        id,
        date,
        imdb_id,
        movie_night_group_id
      `)
      .eq('movie_night_group_id', session.movie_night_group_id)
      .order('date', { ascending: false });

    if (fetchError) {
      console.error('Error fetching movie nights:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch movie nights' },
        { status: 500 }
      );
    }

    return NextResponse.json(movieNights);
  } catch (error) {
    console.error('Fetch movie nights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 