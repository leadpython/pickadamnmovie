import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { handle } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    // Check if handle exists in the database
    const { data, error } = await supabaseAdmin
      .from('movie_night_group')
      .select('handle')
      .eq('handle', handle)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking handle:', error);
      return NextResponse.json(
        { error: 'Failed to check handle availability' },
        { status: 500 }
      );
    }

    // If data exists, handle is taken
    return NextResponse.json({ available: !data });
  } catch (error) {
    console.error('Error in check-handle endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to check handle availability' },
      { status: 500 }
    );
  }
} 