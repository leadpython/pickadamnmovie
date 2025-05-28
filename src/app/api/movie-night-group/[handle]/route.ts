import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    // Fetch the movie night group by handle
    const { data: group, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .select('*')
      .eq('handle', params.handle)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Fetch movie nights for the group
    const { data: movieNights, error: movieNightsError } = await supabaseAdmin
      .from('movie_night')
      .select(`
        id,
        date,
        description,
        imdb_id,
        movies,
        movie_night_group_id
      `)
      .eq('movie_night_group_id', group.id)
      .order('date', { ascending: false });

    if (movieNightsError) {
      return NextResponse.json({ error: 'Failed to fetch movie nights' }, { status: 500 });
    }

    return NextResponse.json({
      group,
      movieNights
    });
  } catch (error) {
    console.error('Error fetching movie night group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 