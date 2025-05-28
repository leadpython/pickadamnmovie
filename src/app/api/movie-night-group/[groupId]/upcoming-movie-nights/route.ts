import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const params_ = await params;
    const { groupId } = params_;
    console.log('Fetching movie nights for group:', groupId);

    const { data: movieNights, error } = await supabaseAdmin
      .from('movie_night')
      .select('*')
      .eq('movie_night_group_id', groupId)
      .order('date', { ascending: true });

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