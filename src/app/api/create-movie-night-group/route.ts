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

    console.log('Checking handle:', handle);

    // Check if handle is already taken
    const { data: existingGroup, error: checkError } = await supabaseAdmin
      .from('movie_night_group')
      .select('id')
      .ilike('handle', handle)
      .maybeSingle();

    console.log('Handle check result:', { existingGroup, checkError });

    if (checkError) {
      console.error('Error checking handle:', checkError);
      return NextResponse.json(
        { error: 'Error checking handle availability' },
        { status: 500 }
      );
    }

    if (existingGroup) {
      console.log('Handle already taken:', existingGroup);
      return NextResponse.json(
        { error: 'Handle is already taken' },
        { status: 400 }
      );
    }

    console.log('Handle is available, proceeding with beta key check');

    // Check if beta key is valid and not in use
    const { data: betaKeyData, error: betaKeyError } = await supabaseAdmin
      .from('betakeys')
      .select('id')
      .eq('id', betakey)
      .maybeSingle();

    console.log('Beta key check result:', { betaKeyData, betaKeyError });

    if (betaKeyError) {
      console.error('Error checking beta key:', betaKeyError);
      return NextResponse.json(
        { error: 'Error checking beta key' },
        { status: 500 }
      );
    }

    if (!betaKeyData) {
      console.log('Invalid beta key');
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
      .maybeSingle();

    console.log('Beta key usage check result:', { existingBetaKey, betaKeyCheckError });

    if (betaKeyCheckError) {
      console.error('Error checking beta key usage:', betaKeyCheckError);
      return NextResponse.json(
        { error: 'Error checking beta key usage' },
        { status: 500 }
      );
    }

    if (existingBetaKey) {
      console.log('Beta key already in use:', existingBetaKey);
      return NextResponse.json(
        { error: 'Beta key is already in use' },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Creating new movie night group');

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

    console.log('Create group result:', { newGroup, createError });

    if (createError) {
      console.error('Error creating movie night group:', createError);
      return NextResponse.json(
        { error: 'Error creating movie night group' },
        { status: 500 }
      );
    }

    // Remove sensitive data before sending response
    const { betakey: _, secret: __, ...safeGroupData } = newGroup;

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