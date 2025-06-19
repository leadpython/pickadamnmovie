import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET() {
  try {
    // Fetch all movies from roster
    const { data: movieRoster, error } = await supabaseAdmin
      .from('movie_roster')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movie roster:', error);
      return NextResponse.json(
        { error: 'Failed to fetch movie roster' },
        { status: 500 }
      );
    }

    return NextResponse.json(movieRoster);
  } catch (error) {
    console.error('Fetch movie roster error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Fetch all movies from roster (alternative method)
    const { data: movieRoster, error: fetchError } = await supabaseAdmin
      .from('movie_roster')
      .select(`
        id,
        created_at,
        imdb_id,
        meta_data
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching movie roster:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch movie roster' },
        { status: 500 }
      );
    }

    return NextResponse.json(movieRoster);
  } catch (error) {
    console.error('Fetch movie roster error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 