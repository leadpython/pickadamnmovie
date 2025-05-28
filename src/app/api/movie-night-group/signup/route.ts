import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { handle, groupName, password, betaKey } = await request.json();

    // Validate required fields
    if (!handle || !groupName || !password || !betaKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if handle is already taken
    const { data: existingGroup } = await supabaseAdmin
      .from('movie_night_group')
      .select('handle')
      .eq('handle', handle)
      .single();

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Handle is already taken' },
        { status: 400 }
      );
    }

    // Validate beta key
    const { data: validBetaKey } = await supabaseAdmin
      .from('betakeys')
      .select('id')
      .eq('id', betaKey)
      .single();

    if (!validBetaKey) {
      return NextResponse.json(
        { error: 'Invalid beta key' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the movie night group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .insert({
        handle,
        name: groupName,
        secret: hashedPassword,
      })
      .select()
      .single();

    if (groupError) {
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      );
    }

    // Create a session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        movie_night_group_id: group.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({
      sessionId: session.id,
      group: {
        id: group.id,
        handle: group.handle,
        name: group.name,
      },
    });

    // Set session cookie
    response.cookies.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 