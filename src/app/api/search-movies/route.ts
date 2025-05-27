import { NextResponse } from 'next/server';

const OMDB_API_KEY = 'c1015d16';
const OMDB_API_URL = 'https://www.omdbapi.com/';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { message: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
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
    console.error('Error searching movies:', error);
    return NextResponse.json(
      { message: 'Failed to search movies' },
      { status: 500 }
    );
  }
} 