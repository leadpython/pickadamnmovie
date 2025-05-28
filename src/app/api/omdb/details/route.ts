import { NextResponse } from 'next/server';

const OMDB_API_KEY = 'c1015d16';
const OMDB_API_URL = 'https://www.omdbapi.com/';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imdbId = searchParams.get('imdbId');

    if (!imdbId) {
      return NextResponse.json(
        { error: 'IMDb ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
    );

    const data = await response.json();

    if (data.Error) {
      return NextResponse.json(
        { error: data.Error },
        { status: 404 }
      );
    }

    const movieData = {
      ...data,
      poster_url: data.Poster
    };

    return NextResponse.json(movieData);
  } catch (error) {
    console.error('OMDB details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
} 