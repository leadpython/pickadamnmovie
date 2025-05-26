import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { handle, name, description, password, betakey } = await request.json();

    if (!handle || !name || !description || !password || !betakey) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if handle is already taken
    const { data: existingGroup, error: checkError } = await supabaseAdmin
      .from('movie_night_group')
      .select('id')
      .eq('handle', handle)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking handle:', checkError);
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

    // Check if beta key is valid and not in use
    const { data: betaKeyData, error: betaKeyError } = await supabaseAdmin
      .from('betakeys')
      .select('id')
      .eq('id', betakey)
      .single();

    if (betaKeyError || !betaKeyData) {
      return NextResponse.json(
        { error: 'Invalid beta key' },
        { status: 400 }
      );
    }

    // Check if beta key is already in use
    const { data: existingBetaKey, error: betaKeyCheckError } = await supabaseAdmin
      .from('movie_night_group')
      .select('id')
      .eq('betakey', betakey)
      .single();

    if (betaKeyCheckError && betaKeyCheckError.code !== 'PGRST116') {
      console.error('Error checking beta key usage:', betaKeyCheckError);
      return NextResponse.json(
        { error: 'Error checking beta key usage' },
        { status: 500 }
      );
    }

    if (existingBetaKey) {
      return NextResponse.json(
        { error: 'Beta key is already in use' },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the movie night group
    const { data: newGroup, error: createError } = await supabaseAdmin
      .from('movie_night_group')
      .insert([
        {
          handle,
          name,
          description,
          betakey,
          secret: hashedPassword
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

    return NextResponse.json({
      success: true,
      group: {
        ...newGroup,
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