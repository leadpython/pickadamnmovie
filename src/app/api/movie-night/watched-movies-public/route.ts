import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { handle } = await request.json();

    // Validate required fields
    if (!handle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the movie night group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .select('id')
      .eq('handle', handle)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Movie night group not found' },
        { status: 404 }
      );
    }

    // Get all past movie nights with selected movies for this group
    const { data: pastMovieNights, error: fetchError } = await supabaseAdmin
      .from('movie_night')
      .select('imdb_id')
      .eq('movie_night_group_id', group.id)
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