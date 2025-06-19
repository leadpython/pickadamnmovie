import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { handle, secretWord } = await request.json();

    // Validate required fields
    if (!handle || !secretWord) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the secret word matches for the given handle
    const { data: group, error } = await supabaseAdmin
      .from('movie_night_group')
      .select('id, secret_word')
      .eq('handle', handle)
      .single();

    if (error || !group) {
      return NextResponse.json(
        { error: 'Movie night group not found' },
        { status: 404 }
      );
    }

    // If no secret word is set for the group, allow access
    if (!group.secret_word) {
      return NextResponse.json({ valid: true });
    }

    // Check if the provided secret word matches
    if (group.secret_word !== secretWord) {
      return NextResponse.json(
        { error: 'Invalid secret word' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Validate secret word error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 