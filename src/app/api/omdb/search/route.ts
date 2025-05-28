import { NextResponse } from 'next/server';

const OMDB_API_KEY = 'c1015d16';
const OMDB_API_URL = 'https://www.omdbapi.com/';

interface OMDBMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDBSearchResponse {
  Search: OMDBMovie[];
  totalResults: string;
  Response: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&page=${page}`
    );
    const data: OMDBSearchResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.Response === 'False' ? 'Movie not found' : 'Failed to search movies');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('OMDB API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search movies' },
      { status: 500 }
    );
  }
} 