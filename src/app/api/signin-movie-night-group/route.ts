import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { handle, password } = await request.json();

    if (!handle || !password) {
      return NextResponse.json(
        { error: 'Handle and password are required' },
        { status: 400 }
      );
    }

    // Find the group by handle
    const { data: group, error: findError } = await supabaseAdmin
      .from('movie_night_group')
      .select('*')
      .eq('handle', handle)
      .single();

    if (findError) {
      console.error('Error finding group:', findError);
      return NextResponse.json(
        { error: 'Error finding group' },
        { status: 500 }
      );
    }

    if (!group) {
      return NextResponse.json(
        { error: 'Invalid handle or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, group.secret);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid handle or password' },
        { status: 401 }
      );
    }

    // Remove sensitive data before sending response
    const { betakey: _, secret: __, ...safeGroupData } = group;

    // Fetch upcoming movie nights for this group
    const { data: movieNights, error: movieNightsError } = await supabaseAdmin
      .from('movie_night')
      .select('*')
      .eq('movie_night_group_id', group.id)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (movieNightsError) {
      console.error('Error fetching movie nights:', movieNightsError);
      return NextResponse.json(
        { error: 'Error fetching movie nights' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      group: {
        ...safeGroupData,
        upcomingMovieNights: movieNights || []
      }
    });
  } catch (error) {
    console.error('Error in signin-movie-night-group route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 