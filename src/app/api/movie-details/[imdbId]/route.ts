import { NextResponse } from 'next/server';

const OMDB_API_KEY = 'c1015d16';
const OMDB_API_URL = 'https://www.omdbapi.com/';

export async function GET(
  request: Request,
  { params }: { params: { imdbId: string } }
) {
  const params_ = await params;
  const { imdbId } = params_;

  if (!imdbId) {
    return NextResponse.json(
      { message: 'IMDB ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from OMDB API');
    }

    const data = await response.json();

    if (data.Error) {
      return NextResponse.json(
        { message: data.Error },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return NextResponse.json(
      { message: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
} 