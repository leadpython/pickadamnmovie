import { NextResponse } from 'next/server';

const OMDB_API_KEY = 'c1015d16';
const OMDB_API_URL = 'https://www.omdbapi.com/';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&page=${page}`
    );

    const data = await response.json();

    if (data.Error) {
      return NextResponse.json(
        { error: data.Error },
        { status: 404 }
      );
    }

    // Transform the search results to include poster_url
    const transformedData = {
      ...data,
      Search: data.Search.map((movie: any) => ({
        ...movie,
        poster_url: movie.Poster
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('OMDB search error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
} 