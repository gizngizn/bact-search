import { NextResponse } from 'next/server';
import { searchBacteria } from '@/lib/search';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const results = searchBacteria(query, Math.min(limit, 100));
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
