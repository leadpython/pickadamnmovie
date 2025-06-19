import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { movieNightId } = await request.json();

    // Validate required fields
    if (!movieNightId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch movie night data without group restrictions (public access)
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching movie night:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 