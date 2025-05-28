import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { betaKey } = await request.json();

    if (!betaKey) {
      return NextResponse.json(
        { error: 'Beta key is required' },
        { status: 400 }
      );
    }

    // Check if beta key exists in the database
    const { data, error } = await supabaseAdmin
      .from('betakeys')
      .select('id')
      .eq('id', betaKey)
      .single();

    if (error) {
      console.error('Error checking beta key:', error);
      return NextResponse.json(
        { error: 'Error checking beta key' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      valid: !!data,
      message: data ? 'Valid beta key' : 'Invalid beta key'
    });
  } catch (error) {
    console.error('Error in check-beta-key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 