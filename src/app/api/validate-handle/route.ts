import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { handle } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
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

    return NextResponse.json({
      isValid: true,
      isTaken: !!existingGroup
    });
  } catch (error) {
    console.error('Error in validate-handle route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 