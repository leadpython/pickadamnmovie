import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Movie night ID is required' },
        { status: 400 }
      );
    }

    // Delete the movie night
    const { error: deleteError } = await supabaseAdmin
      .from('movie_night')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting movie night:', deleteError);
      return NextResponse.json(
        { error: 'Error deleting movie night' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error in delete movie night route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 