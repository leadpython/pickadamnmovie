import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { handle, password } = await request.json();

    // Validate required fields
    if (!handle || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the group by handle
    const { data: group, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .select('id, handle, name, secret')
      .eq('handle', handle)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Invalid handle or password' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, group.secret);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid handle or password' },
        { status: 401 }
      );
    }

    // Check for existing session
    const { data: existingSession } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('movie_night_group_id', group.id)
      .single();

    let sessionId;

    if (existingSession) {
      // Update existing session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now

      const { data: updatedSession, error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({ expires_at: expiresAt.toISOString() })
        .eq('id', existingSession.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update session' },
          { status: 500 }
        );
      }

      sessionId = updatedSession.id;
    } else {
      // Create new session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now

      const { data: newSession, error: sessionError } = await supabaseAdmin
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

      sessionId = newSession.id;
    }

    // Create response with cookie
    const response = NextResponse.json({
      sessionId,
      group: {
        id: group.id,
        handle: group.handle,
        name: group.name,
      },
    });

    // Set session cookie
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 