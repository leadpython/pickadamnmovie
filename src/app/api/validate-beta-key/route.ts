import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'Beta key is required' },
        { status: 400 }
      );
    }

    // First check if the key exists in betakeys table
    const { data: betaKeyData, error: betaKeyError } = await supabaseAdmin
      .from('betakeys')
      .select('id')
      .eq('id', key)
      .single();

    if (betaKeyError) {
      console.error('Error validating beta key:', betaKeyError);
      return NextResponse.json(
        { error: 'Error validating beta key' },
        { status: 500 }
      );
    }

    if (!betaKeyData) {
      return NextResponse.json({ isValid: false, inUse: false });
    }

    // Then check if the key is in use in movienightgroup table
    const { data: groupData, error: groupError } = await supabaseAdmin
      .from('movienightgroup')
      .select('id, handle, name, description, betakey')
      .eq('betakey', key)
      .single();

    if (groupError && groupError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking if beta key is in use:', groupError);
      return NextResponse.json(
        { error: 'Error checking if beta key is in use' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isValid: true,
      inUse: !!groupData,
      groupData: groupData || null
    });
  } catch (error) {
    console.error('Error in validate-beta-key route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 