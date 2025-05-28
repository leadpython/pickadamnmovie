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

    // Check if beta key exists in betakeys table
    const { data: betaKeyData, error: betaKeyError } = await supabaseAdmin
      .from('betakeys')
      .select('id')
      .eq('id', betaKey)
      .single();

    if (betaKeyError && betaKeyError.code !== 'PGRST116') {
      console.error('Error checking beta key:', betaKeyError);
      return NextResponse.json(
        { error: 'Error checking beta key' },
        { status: 500 }
      );
    }

    // If key doesn't exist in betakeys table, it's invalid
    if (!betaKeyData) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid beta key'
      });
    }

    // Check if beta key is already in use in movie_night_group table
    const { data: groupData, error: groupError } = await supabaseAdmin
      .from('movie_night_group')
      .select('betakey')
      .eq('betakey', betaKey)
      .maybeSingle();

    if (groupError) {
      console.error('Error checking beta key usage:', groupError);
      return NextResponse.json(
        { error: 'Error checking beta key usage' },
        { status: 500 }
      );
    }

    // Key is only valid if it exists in betakeys AND is not in use in movie_night_group
    const isValid = !!betaKeyData && !groupData;

    console.log('Beta key check:', groupData);

    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'Valid beta key' : 'Invalid beta key'
    });
  } catch (error) {
    console.error('Error in check-beta-key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 