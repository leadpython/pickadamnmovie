import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { handle, name, password, betakey } = await request.json();

    if (!handle || !name || !password || !betakey) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if handle is already taken
    const { data: existingGroup, error: findError } = await supabaseAdmin
      .from('movie_night_group')
      .select('handle')
      .eq('handle', handle)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error checking handle:', findError);
      return NextResponse.json(
        { error: 'Error checking handle availability' },
        { status: 500 }
      );
    }

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Handle is already taken' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the movie night group
    const { data: group, error: createError } = await supabaseAdmin
      .from('movie_night_group')
      .insert([
        {
          handle,
          name,
          secret: hashedPassword,
          betakey
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating movie night group:', createError);
      return NextResponse.json(
        { error: 'Error creating movie night group' },
        { status: 500 }
      );
    }

    // Remove sensitive data before sending response
    const { betakey: _, secret: __, ...safeGroupData } = group;

    return NextResponse.json({
      success: true,
      group: {
        ...safeGroupData,
        upcomingMovieNights: []
      }
    });
  } catch (error) {
    console.error('Error in create-movie-night-group route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 