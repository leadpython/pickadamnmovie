import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const params_ = await params;
    const { handle } = params_;
    console.log('Fetching movie nights for group:', handle);

    // First get the group ID from the handle
    const { data: group, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .select('id')
      .eq('handle', handle)
      .single();

    if (groupError) {
      console.error('Error finding group:', groupError);
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const { data: movieNights, error } = await supabaseAdmin
      .from('movie_night')
      .select('*')
      .eq('movie_night_group_id', group.id)
      .order('date', { ascending: false }); // Changed to descending order

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Found movie nights:', movieNights);
    return NextResponse.json({ movieNights });
  } catch (error) {
    console.error('Error fetching movie nights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie nights' },
      { status: 500 }
    );
  }
} 