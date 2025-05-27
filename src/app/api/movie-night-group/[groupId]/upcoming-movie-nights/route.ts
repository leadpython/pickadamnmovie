import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const params_ = await params;
    const { groupId } = params_;

    const { data: movieNights, error } = await supabaseAdmin
      .from('movie_night')
      .select('*')
      .eq('movie_night_group_id', groupId)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ movieNights });
  } catch (error) {
    console.error('Error fetching upcoming movie nights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming movie nights' },
      { status: 500 }
    );
  }
} 